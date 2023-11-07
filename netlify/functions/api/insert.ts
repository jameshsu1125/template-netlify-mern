import mongoose from 'mongoose';
import { Demo, DemoID, Respond } from '../type';
import { table } from '../models';
import { messages } from '../config';

const insert = (data: Demo) => {
  return new Promise<Respond>((resolve) => {
    if (mongoose.connections[0].readyState) {
      try {
        const tab = new table(data);
        tab
          .save()
          .then((e: DemoID) => {
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
