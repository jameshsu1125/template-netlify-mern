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
          // JSON.stringify on a mongoose error can throw on circular refs (another crash)
          // and would leak internals to the client
          .catch((error: unknown) => {
            resolve({ res: false, msg: messages.insertError, collection, error });
          });
      } catch (error: unknown) {
        resolve({ res: false, msg: messages.insertError, collection, error });
      }
    } else resolve({ res: false, msg: messages.insertError, collection });
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
          // insertMany resolves to the array of documents, wrapping it again made data
          // a single nested array so callers always saw one row
          .then((e: any) => {
            resolve({ res: true, msg: messages.insertSuccess, data: e, collection });
          })
          .catch((error: unknown) => {
            resolve({ res: false, msg: messages.insertError, collection, error });
          });
      } catch (error: unknown) {
        resolve({ res: false, msg: messages.insertError, collection, error });
      }
    } else resolve({ res: false, msg: messages.insertError, collection });
  });
};

export { insertMany };
