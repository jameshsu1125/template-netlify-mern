import { ActionType } from '@/settings/type';
import Fetcher from 'lesca-fetcher';
import { useContext, useState } from 'react';
import { IRespond, TType } from '../../setting';
import { REST_PATH } from '../settings/config';
import { Context } from '../settings/constant';

type TArgument = { collection: string; data: TType };

const useInsert = () => {
  const [, setContext] = useContext(Context);
  const [state, setState] = useState<IRespond | undefined>();
  const fetch = async (argument: TArgument) => {
    setContext({ type: ActionType.LoadingProcess, state: { enabled: true } });
    const respond = (await Fetcher.post(REST_PATH.insert, argument)) as IRespond;
    setState(respond);
    setContext({ type: ActionType.LoadingProcess, state: { enabled: false } });
  };
  return [state, fetch] as const;
};
export default useInsert;

const useInsertMany = () => {
  const [, setContext] = useContext(Context);
  const [state, setState] = useState<IRespond | undefined>();
  const fetch = async (argument: TArgument) => {
    setContext({ type: ActionType.LoadingProcess, state: { enabled: true } });
    const respond = (await Fetcher.post(REST_PATH.insertMany, argument)) as IRespond;
    setState(respond);
    setContext({ type: ActionType.LoadingProcess, state: { enabled: false } });
  };
  return [state, fetch] as const;
};

export { useInsertMany };
