import { ActionType } from '@/settings/type';
import Fetcher from 'lesca-fetcher';
import { useContext, useState } from 'react';
import { REST_PATH } from '../settings/config';
import { Context } from '../settings/constant';

export type TResult = { res: boolean; msg: string } | undefined;

const useConnect = () => {
  const [, setContext] = useContext(Context);

  const [state, setState] = useState<TResult>();

  const fetch = async () => {
    setContext({ type: ActionType.LoadingProcess, state: { enabled: true } });
    const respond = (await Fetcher.get(REST_PATH.connect)) as TResult;
    setState(respond);
    setContext({ type: ActionType.LoadingProcess, state: { enabled: false } });
  };

  return [state, fetch] as const;
};
export default useConnect;
