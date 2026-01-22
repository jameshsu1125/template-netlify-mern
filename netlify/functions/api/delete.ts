import mongoose from 'mongoose';
import { IRespond } from '../../../setting';
import { messages } from '../config';
import models from '../models';

type Delete = { _id: string };

const deleteOne = ({ collection, data }: { collection: string; data: Delete }) => {
  return new Promise<IRespond>((resolve) => {
    if (mongoose.connections[0].readyState) {
      try {
        const currentModel = models[collection] as typeof mongoose.Model;
        currentModel.deleteOne(data).then((e) => {
          if (e.acknowledged) {
            resolve({ res: true, msg: messages.deleteSuccess, collection });
          } else resolve({ res: false, msg: messages.deleteError });
        });
      } catch (error: unknown) {
        resolve({ res: false, msg: messages.deleteError, error });
      }
    } else resolve({ res: false, msg: messages.deleteError });
  });
};
export default deleteOne;
