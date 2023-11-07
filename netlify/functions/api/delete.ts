import mongoose from 'mongoose';
import { Respond } from '../type';
import { messages } from '../config';
import { table } from '../models';

type Delete = { _id: string };

const deleteOne = (data: Delete) => {
  return new Promise<Respond>((resolve) => {
    if (mongoose.connections[0].readyState) {
      try {
        table.deleteOne(data).then((e) => {
          if (e.acknowledged) {
            resolve({ res: true, msg: messages.deleteSuccess });
          } else resolve({ res: false, msg: messages.deleteError });
        });
      } catch (e: unknown) {
        resolve({ res: false, msg: messages.deleteError });
      }
    } else resolve({ res: false, msg: messages.deleteError });
  });
};
export default deleteOne;
