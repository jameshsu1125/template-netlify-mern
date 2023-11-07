export enum MongoServerStateType {
  offline = 0,
  online = 1,
}

export interface Demo {
  name: string;
  url: string;
  repo: string;
  description: string;
}

export interface DemoID extends Demo {
  _id: string;
  _v: number;
}

export type Respond = {
  res: boolean;
  msg: string;
  data?: DemoID[];
};
