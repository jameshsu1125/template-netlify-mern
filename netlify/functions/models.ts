import mongoose from 'mongoose';
import { SETTING, TType } from '../../setting';
import { IType } from '../../setting/type';

export default SETTING.mongodb.reduce((prev, next) => {
  const { collection, schema } = next;

  const currentSchema = Object.fromEntries(
    Object.entries(schema).map((sch) => {
      const [name, value] = sch;
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
    mongoose.models[collection] ||
    mongoose.model<TType>(
      collection,
      new mongoose.Schema<TType>(currentSchema, { versionKey: false }),
    );
  return { ...prev, [collection]: model };
}, {});
