import mongoose from 'mongoose';
import { IRespond, TType } from '../../../setting';
import { messages } from '../config';
import models from '../models';

const insert = ({ collection, data }: { collection: string; data: TType }) => {
  return new Promise<IRespond>((resolve) => {
    if (mongoose.connections[0].readyState) {
      try {
        const currentModel = models[collection] as typeof mongoose.Model;
        const tab = new currentModel(data);
        tab
          .save()
          .then((e: any) => {
            resolve({ res: true, msg: messages.insertSuccess, collection, data: [e] });
          })
          .catch((e: unknown) => {
            resolve({ res: false, msg: JSON.stringify(e) });
          });
      } catch (e: unknown) {
        resolve({ res: false, msg: messages.insertError });
      }
    } else resolve({ res: false, msg: messages.insertError });
  });
};

export default insert;

const insertMany = ({ collection, data }: { collection: string; data: TType[] }) => {
  return new Promise<IRespond>((resolve) => {
    if (mongoose.connections[0].readyState) {
      try {
        const currentModel = models[collection] as typeof mongoose.Model;
        currentModel
          .insertMany(data)
          .then((e: unknown) => {
            resolve({ res: true, msg: messages.insertSuccess, data: [e], collection });
          })
          .catch((e: unknown) => {
            resolve({ res: false, msg: JSON.stringify(e), collection });
          });
      } catch (e: unknown) {
        resolve({ res: false, msg: messages.insertError, collection });
      }
    } else resolve({ res: false, msg: messages.insertError, collection });
  });
};

export { insertMany };
