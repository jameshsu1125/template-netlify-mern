import { IType } from './type';

// mongodb collection schema setting.
export const SETTING = {
  mongodb: [
    {
      collection: 'user',
      description: 'user profile schema demonstration',
      schema: {
        userID: { type: IType.String, required: true },
        firstName: { type: IType.String, required: true },
        lastName: { type: IType.String, required: true },
        email: { type: IType.String, required: true },
        photo: { type: IType.String, required: true },
        age: { type: IType.Number, required: true },
        timestamp: { type: IType.Date, default: 'Date.now()' },
      },
    },
    {
      collection: 'todo',
      description: 'todo list schema demonstration',
      schema: {
        task: { type: IType.String, required: true },
        description: { type: IType.String, required: true },
        who: { type: IType.String, required: true },
        done: { type: IType.Boolean, default: false },
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
export type TUser = {
  userID: string;
  firstName: string;
  lastName: string;
  email: string;
  photo: string;
  age: number;
  timestamp: string;
};

export type TTodo = {
  task: string;
  description: string;
  who: string;
  done: boolean;
  timestamp: Date;
};

export type TYPE = TUser | TTodo;

// type for Rest api respond
export type IRespond = {
  res: boolean;
  msg: string;
  data?: any[];
};
