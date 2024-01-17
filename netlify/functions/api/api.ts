import bodyParser from 'body-parser';
import cloudinary from 'cloudinary';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Router } from 'express';
import serverless from 'serverless-http';
import { REST_PATH } from '../../../src/settings/config';
import { messages } from '../config';
import connect from './connect';
import deleteOne from './delete';
import insert, { insertMany } from './insert';
import select from './select';
import update from './update';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
const api = express();
api.use(bodyParser.json({ limit: '5mb' }));

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

api.use(cors({ origin: '*' }));
api.use(express.json());

const router = Router();

router.post(`/${REST_PATH.login}`, (req, res) => {
  const { body } = req;
  const { USERNAME = 'admin', PASSWORD = '1234' } = process.env;
  if (body.username === USERNAME && body.password === PASSWORD) {
    res.status(200).json({ res: true, msg: 'login success', data: body });
  } else res.status(200).json({ res: false, msg: 'username or password incorrect.' });
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
    cloudinary.v2.uploader.upload(req.body.image, { folder: 'user' }, (error, result) => {
      if (error) res.status(200).json({ res: false, msg: error });
      else res.status(200).json({ res: true, msg: messages.updateSuccess, data: result });
    });
  } catch (e) {
    res.status(200).json({ res: false, msg: messages.uploadError });
  }
});

router.get(`/${REST_PATH.resources}`, async (_, res) => {
  try {
    cloudinary.v2.search
      .expression('folder:user')
      .max_results(30)
      .execute()
      .then((result) => {
        res.status(200).json({ res: true, msg: messages.uploadSuccess, data: result.resources });
      });
  } catch (e) {
    res.status(200).json({ res: false, msg: messages.uploadError });
  }
});

api.use('/api/', router);

export const handler = serverless(api);
