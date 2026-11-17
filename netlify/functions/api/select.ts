import mongoose from 'mongoose';
import { messages } from '../config';
import models from '../models';
import { IRespond } from '../../../setting';

const select = ({ collection }: { collection: string }) => {
  return new Promise<IRespond>((resolve) => {
    if (mongoose.connections[0].readyState) {
      try {
        const currentModel = models[collection] as typeof mongoose.Model;
        currentModel
          .find()
          .then((data) => {
            resolve({ res: true, msg: messages.selectSuccess, collection, data });
          })
          // without this a rejected query becomes an unhandled rejection and kills the function
          .catch((error: unknown) => {
            resolve({ res: false, msg: messages.selectError, collection, error });
          });
      } catch (error: unknown) {
        resolve({ res: false, msg: messages.selectError, collection, error });
      }
    } else resolve({ res: false, msg: messages.selectError, collection });
  });
};

export default select;
