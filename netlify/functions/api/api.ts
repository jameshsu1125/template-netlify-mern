import bodyParser from 'body-parser';
import cloudinary from 'cloudinary';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Router } from 'express';
import Atobtoa from 'lesca-atobtoa';
import serverless from 'serverless-http';
import { SETTING, TType } from '../../../setting';
import { REST_PATH } from '../../../src/settings/config';
import { UserType } from '../../../src/settings/type';
import { limit, messages } from '../config';
import connect from './connect';
import deleteOne from './delete';
import insert, { insertMany } from './insert';
import select from './select';
import update from './update';
import BunnyCDN from 'lesca-node-bunnycdn';
import { TUploadRespond } from '../../../setting/type';

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

const router = Router();

router.post(`/${REST_PATH.login}`, async (req, res) => {
  const { body } = req;
  const connection = await connect();
  if (!connection.res) {
    res.status(200).json({ res: false, msg: messages.connectError });
  } else {
    if (body.email === process.env.AMIN_EMAIL) {
      const type = UserType.Admin;
      const name = body.name || 'super user';
      const timestamp = new Date().toISOString();
      const data = { type, name, timestamp, email: body.email };
      const token = Atobtoa.toBase64(data);
      res.status(200).json({ res: true, token, type });
    } else {
      const respond = await select({ collection: SETTING.mongodb[0].collection });
      const data = respond.data as Extract<TType, { type: string }>[];
      const matched = data.filter((item) => item.email === body.email);
      if (matched.length === 0) res.status(200).json({ res: false, type: UserType.Guest });
      else {
        const type = matched[0].type as UserType;
        const name = body.name || '';
        const timestamp = body.updated_at || new Date().toISOString();
        const email = matched[0].email;
        const data = { type, name, email, timestamp };
        const token = Atobtoa.toBase64(data);
        res.status(200).json({ res: true, token, type });
      }
    }
  }
});

router.get(`/${REST_PATH.connect}`, async (_, res) => {
  const respond = await connect();
  res.status(200).json(respond);
});

router.post(`/${REST_PATH.select}`, async (req, res) => {
  const connection = await connect();
  if (!connection.res) {
    res.status(200).json({ res: false, msg: messages.connectError });
  } else {
    const respond = await select(req.body);
    res.status(200).json(respond);
  }
});

router.post(`/${REST_PATH.insert}`, async (req, res) => {
  const connection = await connect();
  if (!connection.res) {
    res.status(200).json({ res: false, msg: messages.connectError });
  } else {
    const respond = await insert(req.body);
    res.status(200).json(respond);
  }
});

router.post(`/${REST_PATH.insertMany}`, async (req, res) => {
  const connection = await connect();
  if (!connection.res) {
    res.status(200).json({ res: false, msg: messages.connectError });
  } else {
    const respond = await insertMany(req.body);
    res.status(200).json(respond);
  }
});

router.post(`/${REST_PATH.delete}`, async (req, res) => {
  const connection = await connect();
  if (!connection.res) {
    res.status(200).json({ res: false, msg: messages.connectError });
  } else {
    const respond = await deleteOne(req.body);
    res.status(200).json(respond);
  }
});

router.post(`/${REST_PATH.update}`, async (req, res) => {
  const connection = await connect();
  if (!connection.res) {
    res.status(200).json({ res: false, msg: messages.connectError });
  } else {
    const respond = await update(req.body);
    res.status(200).json(respond);
  }
});

router.post(`/${REST_PATH.upload}`, async (req, res) => {
  try {
    const folder = `${process.env.CLOUDINARY_BASE_FOLDER}${req.body.folder ? `/${req.body.folder}` : ''}`;
    cloudinary.v2.uploader.upload(req.body.image, { folder }, (error, result) => {
      if (error) res.status(200).json({ res: false, msg: error });
      else res.status(200).json({ res: true, msg: messages.updateSuccess, data: result });
    });
  } catch (error) {
    res.status(200).json({ res: false, msg: messages.uploadError, error });
  }
});

router.post(`/${REST_PATH.search}`, async (req, res) => {
  try {
    if (storageType === 'cloudinary') {
      cloudinary.v2.search
        .expression(
          `folder=${process.env.CLOUDINARY_BASE_FOLDER}${req.body.folder ? `/${req.body.folder}` : ''}`,
        )
        .execute()
        .then((result) => {
          res.status(200).json({ res: true, msg: messages.searchSuccess, data: result.resources });
        })
        .catch(() => {
          res.status(200).json({ res: false, msg: messages.searchError });
        });
    } else {
      const result = await BunnyCDN.list({
        ...bunnyCdnConfig,
      });
      const files = result.files?.map((item) => {
        const resources: TUploadRespond = {
          access_control: null,
          access_mode: '',
          aspect_ratio: 0,
          asset_id: '',
          backup_bytes: 0,
          bytes: item.Length,
          created_at: item.DateCreated,
          created_by: { access_key: '' },
          etag: item.Checksum,
          filename: item.ObjectName,
          folder: item.Path,
          format: item.ContentType.split('/')[1],
          height: 0,
          pixels: 0,
          public_id: item.ObjectName,
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
      });
      res.status(200).json({ res: true, msg: messages.searchSuccess, data: files });
    }
  } catch (error) {
    res.status(200).json({ res: false, msg: messages.searchError, error });
  }
});

router.post(`/${REST_PATH.remove}`, async (req, res) => {
  try {
    cloudinary.v2.uploader.destroy(req.body.public_id, (error: any, result: any) => {
      if (error) res.status(200).json({ res: false, msg: messages.removeError });
      else res.status(200).json({ res: true, msg: messages.removeSuccess, data: result });
    });
  } catch (error) {
    res.status(200).json({ res: false, msg: messages.uploadError, error });
  }
});

router.post(`/${REST_PATH.removeMany}`, async (req, res) => {
  try {
    cloudinary.v2.api.delete_resources(req.body.public_ids, (error, result) => {
      if (error) res.status(200).json({ res: false, msg: messages.removeError });
      else res.status(200).json({ res: true, msg: messages.removeSuccess, data: result });
    });
  } catch (error) {
    res.status(200).json({ res: false, msg: messages.uploadError, error });
  }
});

app.use('/api/', router);

export const handler = serverless(app);
