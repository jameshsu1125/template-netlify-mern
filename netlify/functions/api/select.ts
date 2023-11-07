import mongoose from 'mongoose';
import { messages } from '../config';
import { table } from '../models';
import { Respond } from '../type';

const select = () => {
  return new Promise<Respond>((resolve) => {
    if (mongoose.connections[0].readyState) {
      try {
        table.find().then((data) => {
          resolve({ res: true, msg: messages.selectSuccess, data });
        });
      } catch (error: unknown) {
        resolve({ res: false, msg: messages.selectError });
      }
    } else resolve({ res: false, msg: messages.selectError });
  });
};

export default select;
