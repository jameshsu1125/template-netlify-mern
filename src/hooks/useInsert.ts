import { ActionType } from '@/settings/type';
import Fetcher from 'lesca-fetcher';
import { useContext, useState } from 'react';
import { IRespond, TYPE } from '../../setting';
import { REST_PATH } from '../settings/config';
import { Context } from '../settings/constant';

export type TResult = IRespond | undefined;

const useInsert = () => {
  const [, setContext] = useContext(Context);
  const [state, setState] = useState<TResult>();
  const fetch = async (parm: { table: string; data: TYPE }) => {
    console.log(parm.data);

    setContext({ type: ActionType.LoadingProcess, state: { enabled: true } });
    const respond = (await Fetcher.post(REST_PATH.insert, parm)) as TResult;
    setState(respond);
    console.log(respond);

    setContext({ type: ActionType.LoadingProcess, state: { enabled: false } });
  };
  return [state, fetch] as const;
};
export default useInsert;
