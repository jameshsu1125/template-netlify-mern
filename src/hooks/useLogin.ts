import { ActionType } from '@/settings/type';
import Fetcher from 'lesca-fetcher';
import { useContext, useState } from 'react';
import { IRespond } from '../../setting';
import { REST_PATH } from '../settings/config';
import { Context } from '../settings/constant';

export type TParm = {
  username: string;
  password: string;
};

const useLogin = () => {
  const [, setContext] = useContext(Context);
  const [state, setState] = useState<IRespond>();

  const fetch = async (data: TParm) => {
    setContext({ type: ActionType.LoadingProcess, state: { enabled: true } });
    const respond = (await Fetcher.post(REST_PATH.login, data)) as IRespond;
    setState(respond);
    setContext({ type: ActionType.LoadingProcess, state: { enabled: false } });
  };

  return [state, fetch] as const;
};
export default useLogin;
