import bodyParser from 'body-parser';
import cloudinary from 'cloudinary';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Router } from 'express';
import serverless from 'serverless-http';
import { REST_PATH } from '../../../src/settings/config';
import { limit, messages } from '../config';
import { guard, guardCollection, type IAuthedRequest } from './auth';
import connect from './connect';
import deleteOne from './delete';
import insert, { insertMany } from './insert';
import select from './select';
import update from './update';
import BunnyCDN from 'lesca-node-bunnycdn';
import { CloudinaryUploadedResult, TUploadRespond } from '../../../setting/type';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
const app = express();

app.use(bodyParser.json({ limit }));
app.use(bodyParser.urlencoded({ extended: true, limit }));
app.use(express.json({ limit }));

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const bunnyCdnConfig = {
  password: process.env.BUNNY_PASSWORD || 'unset',
  storageZone: process.env.BUNNY_STORAGE_ZONE || 'demo',
  folderName: process.env.BUNNY_FOLDER_NAME || '',
  region: process.env.BUNNY_REGION || 'SG',
};

const storageType: 'cloudinary' | 'bunnycdn' =
  process.env.CLOUD_STORAGE_TYPE === 'cloudinary' ? 'cloudinary' : 'bunnycdn';

app.use(cors({ origin: '*' }));
app.use(express.json());

/** same host rule as lesca-node-bunnycdn: region prefix when one is configured */
const bunnyStorageHost = () =>
  bunnyCdnConfig.region ? `${bunnyCdnConfig.region}.storage.bunnycdn.com` : 'storage.bunnycdn.com';

/** storage path of a listed object, e.g. `inquiry/001/photo.jpeg`, folders keep a trailing slash */
const bunnyStoragePath = (path: string, objectName: string, isDirectory: boolean) => {
  const prefix = `/${bunnyCdnConfig.storageZone}/`;
  const dir = path.startsWith(prefix) ? path.slice(prefix.length) : path.replace(/^\/+/, '');
  return `${dir}${objectName}${isDirectory ? '/' : ''}`;
};

/**
 * turns an album identifier (storage path or CDN url) into a storage path to delete.
 * returns null when the value could reach more than the one file or folder it names:
 * `''`, `'/'`, `'inquiry/'` and `..` segments would otherwise wipe the whole album or zone.
 */
const toBunnyPath = (value: unknown): string | null => {
  if (typeof value !== 'string' || value === '') return null;

  let raw = value;
  if (/^https?:\/\//i.test(raw)) {
    try {
      raw = new URL(raw).pathname;
    } catch {
      return null;
    }
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return null;
  }
  if (decoded.includes('\0') || decoded.includes('\\')) return null;

  const isFolder = decoded.endsWith('/');
  const segments = decoded.split('/').filter((segment) => segment !== '');
  if (segments.length === 0) return null;
  if (segments.some((segment) => segment === '.' || segment === '..')) return null;

  // with a root folder configured, the target must live inside it and name something below it
  const root = bunnyCdnConfig.folderName;
  if (root && (segments[0] !== root || segments.length < 2)) return null;

  return segments.join('/') + (isFolder ? '/' : '');
};

/**
 * deletes one object. the bundled deleteFile() keeps only the first folder level of the href
 * and never prepends folderName, so nested images silently missed their target
 */
const removeFromBunny = async (path: string) => {
  const response = await fetch(
    `https://${bunnyStorageHost()}/${bunnyCdnConfig.storageZone}/${path}`,
    {
      method: 'DELETE',
      headers: { AccessKey: bunnyCdnConfig.password },
    },
  );
  return { res: response.status === 200, status: response.status, path };
};

const router = Router();

router.get(`/${REST_PATH.connect}`, async (_, res) => {
  const respond = await connect();
  res.status(200).json(respond);
});

// every route below this line requires a verified Auth0 access token
router.use(guard);

router.post(`/${REST_PATH.login}`, async (req: IAuthedRequest, res) => {
  const { identity } = req;
  res.status(200).json({ res: true, type: identity?.type, email: identity?.email });
});

router.post(`/${REST_PATH.select}`, guardCollection, async (req, res) => {
  const respond = await select(req.body);
  res.status(200).json(respond);
});

router.post(`/${REST_PATH.insert}`, guardCollection, async (req, res) => {
  const respond = await insert(req.body);
  res.status(200).json(respond);
});

router.post(`/${REST_PATH.insertMany}`, guardCollection, async (req, res) => {
  const respond = await insertMany(req.body);
  res.status(200).json(respond);
});

router.post(`/${REST_PATH.delete}`, guardCollection, async (req, res) => {
  const respond = await deleteOne(req.body);
  res.status(200).json(respond);
});

router.post(`/${REST_PATH.update}`, guardCollection, async (req, res) => {
  const respond = await update(req.body);
  res.status(200).json(respond);
});

router.post(`/${REST_PATH.upload}`, async (req, res) => {
  try {
    const base64Image = req.body.image;
    if (!base64Image) {
      res.status(200).json({ res: false, msg: 'No image provided' });
      return;
    }

    if (storageType === 'cloudinary') {
      const folder = `${process.env.CLOUDINARY_BASE_FOLDER}${req.body.folder ? `/${req.body.folder}` : ''}`;
      cloudinary.v2.uploader.upload(base64Image, { folder }, (error, result) => {
        if (error) res.status(200).json({ res: false, msg: error });
        else res.status(200).json({ res: true, msg: messages.updateSuccess, data: result });
      });
    } else {
      const folder = req.body.folder || '';
      const result = await BunnyCDN.upload({
        format: 'jpeg',
        buffer: Buffer.from(base64Image.split(',')[1], 'base64'),
        folder,
        ...bunnyCdnConfig,
      });

      const public_id = result.url?.split('/').pop() || '';
      const data: CloudinaryUploadedResult = {
        public_id,
        version: 0,
        signature: '',
        width: 0,
        height: 0,
        format: public_id.split('.').pop() || 'jpeg',
        resource_type: 'image',
        created_at: '',
        tags: [],
        pages: 0,
        bytes: 0,
        type: 'image',
        etag: '',
        placeholder: false,
        url: result.url || '',
        secure_url: result.url || '',
        access_control: [],
        original_filename: public_id,
        moderation: [],
        access_mode: '',
        context: {},
        metadata: {},
        colors: [],
      };
      res.status(200).json({ res: true, msg: messages.uploadSuccess, data });
    }
  } catch (error) {
    res.status(200).json({ res: false, msg: messages.uploadError, error });
  }
});

/** cloudinary full folder path; '*' and empty mean the base folder */
const cloudinaryPath = (folder?: string) => {
  const base = process.env.CLOUDINARY_BASE_FOLDER || '';
  if (!folder || folder === '*') return base;
  return base ? `${base}/${folder}` : folder;
};

/** a folder entry shaped like a listed file, so both storages answer search the same way */
const toFolderItem = (name: string, public_id: string, folder: string): TUploadRespond => ({
  access_control: null,
  access_mode: '',
  aspect_ratio: 0,
  asset_id: '',
  backup_bytes: 0,
  bytes: 0,
  created_at: '',
  created_by: { access_key: '' },
  etag: '',
  filename: name,
  folder,
  format: '',
  height: 0,
  pixels: 0,
  public_id,
  resource_type: 'folder',
  secure_url: '',
  status: 'available',
  type: 'folder',
  uploaded_at: '',
  uploaded_by: { access_key: '' },
  url: '',
  version: 0,
  width: 0,
});

router.post(`/${REST_PATH.search}`, async (req, res) => {
  try {
    if (storageType === 'cloudinary') {
      const path = cloudinaryPath(req.body.folder);
      const parent = req.body.folder && req.body.folder !== '*' ? req.body.folder : '';
      Promise.all([
        cloudinary.v2.search.expression(`folder="${path}"`).execute(),
        // sub folders are optional: a failure here must not hide the files
        cloudinary.v2.api
          .sub_folders(path)
          .catch(() => ({ folders: [] as { name: string; path: string }[] })),
      ])
        .then(([result, sub]) => {
          const folders = (sub.folders as { name: string; path: string }[]).map((item) =>
            toFolderItem(item.name, `${item.path}/`, parent),
          );
          res.status(200).json({
            res: true,
            msg: messages.searchSuccess,
            data: [...folders, ...result.resources],
          });
        })
        .catch(() => {
          res.status(200).json({ res: false, msg: messages.searchError });
        });
    } else {
      const currentFolder = req.body.folder === '*' ? '' : req.body.folder;
      const result = await BunnyCDN.list({
        folder: currentFolder,
        configOverrides: bunnyCdnConfig,
      });
      const files = result.files
        ?.map((item) => {
          const resources: TUploadRespond = {
            access_control: null,
            access_mode: '',
            aspect_ratio: 0,
            asset_id: '',
            backup_bytes: 0,
            bytes: item.Length,
            created_at: item.DateCreated,
            created_by: { access_key: item.Guid },
            etag: item.Checksum,
            filename: item.ObjectName,
            folder: item.Path.replace(`/${bunnyCdnConfig.storageZone}/`, '').replace(/\/$/, ''),
            format: item.ContentType.split('/')[1] || '',
            height: 0,
            pixels: 0,
            // the full storage path, so delete can address this object without guessing a folder
            public_id: bunnyStoragePath(item.Path, item.ObjectName, item.IsDirectory),
            resource_type: item.IsDirectory ? 'folder' : 'file',
            secure_url: item.Url,
            status: 'available',
            type: item.IsDirectory ? 'folder' : 'file',
            uploaded_at: item.DateCreated,
            uploaded_by: { access_key: '' },
            url: item.Url,
            version: 0,
            width: 0,
          };
          return resources;
        })
        .sort((a) => {
          return a.resource_type === 'folder' ? -1 : 1;
        });
      res.status(200).json({ res: true, msg: messages.searchSuccess, data: files });
    }
  } catch (error) {
    res.status(200).json({ res: false, msg: messages.searchError, error });
  }
});

router.post(`/${REST_PATH.remove}`, async (req, res) => {
  try {
    if (storageType === 'cloudinary') {
      cloudinary.v2.uploader.destroy(req.body.public_id, (error: any, result: any) => {
        if (error) res.status(200).json({ res: false, msg: messages.removeError });
        else res.status(200).json({ res: true, msg: messages.removeSuccess, data: result });
      });
    } else {
      const path = toBunnyPath(req.body.public_id);
      if (!path) {
        res.status(400).json({ res: false, msg: messages.removeInvalidTarget });
        return;
      }
      const result = await removeFromBunny(path);
      if (result.res)
        res.status(200).json({ res: true, msg: messages.removeSuccess, data: result });
      else res.status(200).json({ res: false, msg: messages.removeError, data: result });
    }
  } catch (error) {
    res.status(200).json({ res: false, msg: messages.removeError, error });
  }
});

router.post(`/${REST_PATH.removeMany}`, async (req, res) => {
  try {
    if (storageType === 'cloudinary') {
      cloudinary.v2.api.delete_resources(req.body.public_ids, (error, result) => {
        if (error) res.status(200).json({ res: false, msg: messages.removeError });
        else res.status(200).json({ res: true, msg: messages.removeSuccess, data: result });
      });
    } else {
      const ids: unknown[] = Array.isArray(req.body.public_ids) ? req.body.public_ids : [];
      const paths = ids.map(toBunnyPath);
      // every target is validated before anything is deleted, so one bad value cannot
      // leave the album half removed
      if (paths.length === 0 || paths.some((item) => item === null)) {
        res.status(400).json({ res: false, msg: messages.removeInvalidTarget });
        return;
      }
      const results = await Promise.all(paths.map((item) => removeFromBunny(item as string)));
      const allRemoved = results.every((item) => item.res);
      res.status(200).json({
        res: allRemoved,
        msg: allRemoved ? messages.removeSuccess : messages.removeError,
        data: results,
      });
    }
  } catch (error) {
    res.status(200).json({ res: false, msg: messages.removeError, error });
  }
});

app.use('/api/', router);

export const handler = serverless(app);
