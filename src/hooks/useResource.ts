import { REST_PATH } from '@/settings/config';
import { Context } from '@/settings/constant';
import { ActionType } from '@/settings/type';
import Fetcher from 'lesca-fetcher';
import { useContext, useState } from 'react';
import { TUploadResult } from '../../setting';

const useResource = () => {
  const [, setContext] = useContext(Context);
  const [state, setState] = useState<TUploadResult | undefined>();
  const fetch = async () => {
    setContext({ type: ActionType.LoadingProcess, state: { enabled: true } });
    const respond = (await Fetcher.get(REST_PATH.resources)) as TUploadResult;
    setState(respond);
    setContext({ type: ActionType.LoadingProcess, state: { enabled: false } });
  };
  return [state, fetch] as const;
};
export default useResource;
