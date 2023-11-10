import mongoose from 'mongoose';
import { SETTING, TYPE } from '../../setting';
import { IType } from '../../setting/type';

export default SETTING.mongodb.reduce((prev, next) => {
  const { table, schema } = next;

  const currentSchema = Object.fromEntries(
    Object.entries(schema).map((tab) => {
      const [name, value] = tab;
      const currentTab: { [key: string]: any } = {};
      let currentType: any = String;
      if (value.type) {
        switch (value.type) {
          case IType.Number:
            currentType = Number;
            break;
          case IType.Boolean:
            currentType = Boolean;
            break;
          case IType.Date:
            currentType = Date;
            break;
          case IType.String:
          default:
            currentType = String;
        }
      }
      currentTab.type = currentType;

      if (value.required) currentTab.required = value.required;
      if (value.default) {
        if (value.default === 'Date.now()') currentTab.default = Date.now();
        else currentTab.default = value.default;
      }
      return [name, currentTab];
    }),
  );

  const model =
    mongoose.models[table] || mongoose.model<TYPE>(table, new mongoose.Schema<TYPE>(currentSchema));
  return { ...prev, [table]: model };
}, {});
