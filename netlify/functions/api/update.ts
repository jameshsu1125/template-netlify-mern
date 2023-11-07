import mongoose from 'mongoose';
import { messages } from '../config';
import { table } from '../models';
import { Demo, Respond } from '../type';

type UpdateData = {
  filter: string;
  data: Partial<Demo>;
};
const update = (data: UpdateData) => {
  return new Promise<Respond>((resolve) => {
    if (mongoose.connections[0].readyState) {
      try {
        table.findOneAndUpdate({ _id: data.filter }, data.data).then(() => {
          resolve({ res: true, msg: messages.updateSuccess });
        });
      } catch (error: unknown) {
        resolve({ res: false, msg: messages.updateError });
      }
    } else resolve({ res: false, msg: messages.updateError });
  });
};

export default update;
