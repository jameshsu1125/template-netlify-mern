import mongoose from 'mongoose';
import { SETTING, TYPE } from '../../setting';

export default SETTING.mongodb.reduce((prev, next) => {
  const { table, schema } = next;
  const model =
    mongoose.models[table] || mongoose.model<TYPE>(table, new mongoose.Schema<TYPE>(schema));
  return { ...prev, [table]: model };
}, {});
