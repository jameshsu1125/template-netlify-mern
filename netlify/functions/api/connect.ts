import mongoose from 'mongoose';
import { messages } from '../config';
import { IRespond } from '../../../setting';

mongoose.set('strictQuery', true);

const { DATABASE, URI } = process.env;
const connect = () => {
  return new Promise<IRespond>((resolve) => {
    if (mongoose.connections[0].readyState) {
      resolve({ res: true, msg: messages.connectConnected });
    } else {
      mongoose
        .connect(`${URI}${DATABASE}`)
        .then(() => {
          resolve({ res: true, msg: messages.connectSuccess });
        })
        .catch(() => {
          resolve({ res: false, msg: messages.connectError });
        });
    }
  });
};

export default connect;
