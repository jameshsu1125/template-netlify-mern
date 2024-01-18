import { REST_PATH } from '@/settings/config';
import { Context } from '@/settings/constant';
import { ActionType } from '@/settings/type';
import Fetcher from 'lesca-fetcher';
import { useContext, useState } from 'react';
import { TUploadResult } from '../../setting';

type T = {
  folder: string;
};

const useResource = () => {
  const [, setContext] = useContext(Context);
  const [state, setState] = useState<TUploadResult | undefined>();
  const fetch = async (parm: T) => {
    setContext({ type: ActionType.LoadingProcess, state: { enabled: true } });
    const respond = (await Fetcher.post(REST_PATH.search, parm)) as TUploadResult;
    setState(respond);
    setContext({ type: ActionType.LoadingProcess, state: { enabled: false } });
  };
  return [state, fetch] as const;
};
export default useResource;
