import mongoose from 'mongoose';
import { messages } from '../config';
import models from '../models';
import { IRespond } from '../../../setting';

const select = ({ collection }: { collection: string }) => {
  return new Promise<IRespond>((resolve) => {
    if (mongoose.connections[0].readyState) {
      try {
        const currentModel = models[collection] as typeof mongoose.Model;
        currentModel.find().then((data) => {
          resolve({ res: true, msg: messages.selectSuccess, collection, data });
        });
      } catch (error: unknown) {
        resolve({ res: false, msg: messages.selectError, collection });
      }
    } else resolve({ res: false, msg: messages.selectError, collection });
  });
};

export default select;
