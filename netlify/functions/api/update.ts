import mongoose from 'mongoose';
import { messages } from '../config';
import models from '../models';
import { IRespond, TYPE } from '../../../setting';

type UpdateData = {
  filter: string;
  data: Partial<TYPE>;
};
const update = ({ collection, data }: { collection: string; data: UpdateData }) => {
  return new Promise<IRespond>((resolve) => {
    if (mongoose.connections[0].readyState) {
      try {
        const currentModel = models[collection] as typeof mongoose.Model;
        currentModel.findOneAndUpdate({ _id: data.filter }, data.data).then(() => {
          resolve({ res: true, msg: messages.updateSuccess });
        });
      } catch (error: unknown) {
        resolve({ res: false, msg: messages.updateError });
      }
    } else resolve({ res: false, msg: messages.updateError });
  });
};

export default update;
