import { ReadyOnly } from '@/settings/type-unity';
import { IType, TUploadRespond } from './type';

// mongodb collection schema setting.
export const SETTING = {
  mongodb: [
    {
      collection: 'user',
      schema: {
        userName: { type: IType.String, required: true },
        email: { type: IType.String, required: true },
        type: { type: IType.String, required: true },
        timestamp: { type: IType.Date, default: 'Date.now()' },
      },
    },
    {
      collection: 'editor',
      schema: {
        html: { type: IType.String, required: true },
        timestamp: { type: IType.Date, default: 'Date.now()' },
      },
    },
  ],
} as const;

// Infer document types from the MongoDB collection schemas.
type MongoSetting = (typeof SETTING.mongodb)[number];
type MongoCollection = MongoSetting['collection'];

type SchemaFieldType<TField> = TField extends { type: infer TFieldType }
  ? TFieldType extends IType.String
    ? string
    : TFieldType extends IType.Number
      ? number
      : TFieldType extends IType.Boolean
        ? boolean
        : TFieldType extends IType.Date
          ? Date
          : TFieldType extends IType.Array
            ? unknown[]
            : TFieldType extends IType.Object
              ? Record<string, unknown>
              : never
  : never;

type SchemaType<TSchema> = {
  [TKey in keyof TSchema]: SchemaFieldType<TSchema[TKey]>;
};

type MongoTypeMap = {
  [TSetting in MongoSetting as TSetting['collection']]: SchemaType<TSetting['schema']>;
};

export type TType<TCollection extends MongoCollection = MongoCollection> =
  MongoTypeMap[TCollection];

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
