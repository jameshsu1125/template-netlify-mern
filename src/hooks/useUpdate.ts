import { ActionType } from '@/settings/type';
import { post } from '@/settings/fetcher';
import { useContext, useState } from 'react';
import { IRespond, TType } from '../../setting';
import { REST_PATH } from '../settings/config';
import { Context } from '../settings/constant';

type TArgument = { collection: string; data: { _id: string; data: Partial<TType> } };
const useUpdate = () => {
  const [, setContext] = useContext(Context);
  const [state, setState] = useState<IRespond | undefined>();
  const fetch = async (argument: TArgument) => {
    setContext({ type: ActionType.LoadingProcess, state: { enabled: true } });
    const respond = await post<IRespond>(REST_PATH.update, argument);
    setState(respond);
    setContext({ type: ActionType.LoadingProcess, state: { enabled: false } });
  };
  return [state, fetch] as const;
};
export default useUpdate;
