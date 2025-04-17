import { ActionType, UserType } from '@/settings/type';
import { User } from '@auth0/auth0-react';
import Fetcher from 'lesca-fetcher';
import { useContext, useState } from 'react';
import { REST_PATH } from '../settings/config';
import { Context } from '../settings/constant';

type TLoginRespond = {
  res: boolean;
  type: UserType;
  token: string;
};

const useLogin = () => {
  const [, setContext] = useContext(Context);
  const [state, setState] = useState<TLoginRespond | undefined>();
  const fetch = async (user: User) => {
    setContext({ type: ActionType.LoadingProcess, state: { enabled: true } });
    const respond = (await Fetcher.post(REST_PATH.login, user)) as TLoginRespond;
    if (respond.res) Fetcher.setJWT(respond.token);
    setState(respond);
    setContext({ type: ActionType.LoadingProcess, state: { enabled: false } });
  };

  return [state, fetch] as const;
};
export default useLogin;
