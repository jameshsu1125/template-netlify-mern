import { IType } from './type';

// mongodb collection schema setting.
export const SETTING = {
  mongodb: [
    {
      table: 'user',
      description: '登入使用者帳號密碼',
      schema: {
        username: { type: IType.String, required: true },
        password: { type: IType.String, required: true },
      },
    },
    {
      table: 'todo',
      description: '工作列表',
      schema: {
        title: { type: IType.String, required: true },
        description: { type: IType.String, required: true },
        age: { type: IType.Number },
        close: { type: IType.Boolean, default: false },
        timestamp: { type: IType.Date, default: 'Date.now()' },
      },
    },
  ],
  dashboard: {
    session: {
      name: 'status',
      time: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  },
};

// type for mongodb
export type TUser = { username: string; password: string };
export type TTodo = { title: string; description: string; close: boolean; timestamp: Date };
export type TYPE = TUser | TTodo;

// type for Rest api respond
export type IRespond = {
  res: boolean;
  msg: string;
  data?: any[];
};
