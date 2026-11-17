import { post } from '@/settings/fetcher';
import { ActionType, UserType } from '@/settings/type';
import { useContext, useState } from 'react';
import { REST_PATH } from '../settings/config';
import { Context } from '../settings/constant';

type TLoginRespond = {
  res: boolean;
  type: UserType;
  email?: string;
  msg?: string;
};

/**
 * asks the backend who the caller is.
 * the identity comes from the verified Auth0 access token, nothing is sent in the body.
 */
const useLogin = () => {
  const [, setContext] = useContext(Context);
  const [state, setState] = useState<TLoginRespond | undefined>();
  const fetch = async () => {
    setContext({ type: ActionType.LoadingProcess, state: { enabled: true } });
    const respond = await post<TLoginRespond>(REST_PATH.login, {});
    setState(respond);
    setContext({ type: ActionType.LoadingProcess, state: { enabled: false } });
  };

  return [state, fetch] as const;
};
export default useLogin;
