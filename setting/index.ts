export enum IType {
  String = 'String',
  Number = 'Number',
  Boolean = 'Boolean',
  Date = 'Date',
}

export const SETTING = {
  mongodb: [
    {
      table: 'user',
      description: '登入使用者帳號密碼',
      schema: {
        username: { type: String, required: true },
        password: { type: String, required: true },
      },
      type: {
        username: { type: IType.String, required: true },
        password: { type: IType.String, required: true },
      },
    },
    {
      table: 'todo',
      description: '工作列表',
      schema: {
        title: { type: String, required: true },
        description: { type: String, required: true },
        close: { type: Boolean, default: false },
        timestamp: { type: Date, default: Date.now() },
      },
      type: {
        title: { type: IType.String, required: true },
        description: { type: IType.String, required: true },
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

export type TUser = { username: string; password: string };
export type TTodo = { title: string; description: string; close: boolean; timestamp: Date };
export type TYPE = TUser | TTodo;

export type IRespond = {
  res: boolean;
  msg: string;
  data?: any[];
};
