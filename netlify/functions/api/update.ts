import mongoose from 'mongoose';
import { messages } from '../config';
import models from '../models';
import { IRespond, TType } from '../../../setting';

type UpdateData = {
  _id: string;
  data: Partial<TType>;
};
const update = ({ collection, data }: { collection: string; data: UpdateData }) => {
  return new Promise<IRespond>((resolve) => {
    if (mongoose.connections[0].readyState) {
      try {
        const currentModel = models[collection] as typeof mongoose.Model;
        const { _id } = data;
        currentModel.findOneAndUpdate({ _id }, data.data).then(() => {
          resolve({ res: true, msg: messages.updateSuccess, collection });
        });
      } catch (error: unknown) {
        resolve({ res: false, msg: messages.updateError, collection });
      }
    } else resolve({ res: false, msg: messages.updateError, collection });
  });
};

export default update;
