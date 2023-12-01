import { ActionType } from '@/settings/type';
import Fetcher from 'lesca-fetcher';
import { useContext, useState } from 'react';
import { IRespond } from '../../setting';
import { REST_PATH } from '../settings/config';
import { Context } from '../settings/constant';

type TArgument = { collection: string; data: { _id: string } };

const useDelete = () => {
  const [, setContext] = useContext(Context);
  const [state, setState] = useState<IRespond | undefined>();
  const fetch = async (Argument: TArgument) => {
    setContext({ type: ActionType.LoadingProcess, state: { enabled: true } });
    const respond = (await Fetcher.post(REST_PATH.delete, Argument)) as IRespond;
    setState(respond);
    setContext({ type: ActionType.LoadingProcess, state: { enabled: false } });
  };
  return [state, fetch] as const;
};
export default useDelete;
