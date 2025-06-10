import { ReadyOnly } from '@/settings/type-unity';
import { IType, TUploadRespond } from './type';

// mongodb collection schema setting.
export const SETTING = {
  mongodb: [
    {
      collection: 'user',
      description: 'user profile schema demonstration',
      schema: {
        userName: { type: IType.String, required: true },
        email: { type: IType.String, required: true },
        type: { type: IType.String, required: true },
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
};

// set type for mongodb
export type TType =
  | {
      userName: string;
      email: string;
      type: string;
      timestamp: string;
    }
  | {
      task: string;
      description: string;
      who: string;
      done: boolean;
      timestamp: Date;
    };

// type for api respond
export type IRespond = ReadyOnly<{
  res: boolean;
  msg: string;
  collection: string;
  data: TType[];
}>;

export type TUploadResult = ReadyOnly<{
  res: boolean;
  msg: string;
  collection: string;
  data: TUploadRespond[];
}>;
