import mongoose from 'mongoose';
import { IRespond, TYPE } from '../../../setting';
import { messages } from '../config';
import models from '../models';

const insert = ({ collection, data }: { collection: string; data: TYPE }) => {
  return new Promise<IRespond>((resolve) => {
    if (mongoose.connections[0].readyState) {
      try {
        const currentModel = models[collection] as typeof mongoose.Model;
        const tab = new currentModel(data);
        tab
          .save()
          .then((e: any) => {
            resolve({ res: true, msg: messages.insertSuccess, data: [e] });
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
