import { ActionType } from '@/settings/type';
import Fetcher from 'lesca-fetcher';
import { useContext, useState } from 'react';
import { IRespond, TYPE } from '../../setting';
import { REST_PATH } from '../settings/config';
import { Context } from '../settings/constant';

export type TResult = IRespond | undefined;
type TUpdate = {
  filter: string;
  data: Partial<TYPE>;
};

const useUpdate = () => {
  const [, setContext] = useContext(Context);
  const [state, setState] = useState<TResult>();
  const fetch = async (parm: { collection: string; data: TUpdate }) => {
    setContext({ type: ActionType.LoadingProcess, state: { enabled: true } });
    const respond = (await Fetcher.post(REST_PATH.update, parm)) as TResult;
    setState(respond);
    setContext({ type: ActionType.LoadingProcess, state: { enabled: false } });
  };
  return [state, fetch] as const;
};
export default useUpdate;
