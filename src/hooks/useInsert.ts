import { ActionType } from '@/settings/type';
import { post } from '@/settings/fetcher';
import { useContext, useState } from 'react';
import { IRespond, TType } from '../../setting';
import { REST_PATH } from '../settings/config';
import { Context } from '../settings/constant';

type TArgument = { collection: string; data: Omit<TType, 'timestamp'> };

const useInsert = () => {
  const [, setContext] = useContext(Context);
  const [state, setState] = useState<IRespond | undefined>();
  const fetch = async (argument: TArgument) => {
    setContext({ type: ActionType.LoadingProcess, state: { enabled: true } });
    const respond = await post<IRespond>(REST_PATH.insert, argument);
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
    const respond = await post<IRespond>(REST_PATH.insertMany, argument);
    setState(respond);
    setContext({ type: ActionType.LoadingProcess, state: { enabled: false } });
  };
  return [state, fetch] as const;
};

export { useInsertMany };
