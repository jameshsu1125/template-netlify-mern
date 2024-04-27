import { REST_PATH } from '@/settings/config';
import { Context } from '@/settings/constant';
import { ActionType } from '@/settings/type';
import Fetcher from 'lesca-fetcher';
import { useContext, useEffect, useState } from 'react';
import { TUploadResult } from '../../setting';

type T = {
  folder: string;
};

const useSearch = () => {
  const [, setContext] = useContext(Context);
  const [state, setState] = useState<TUploadResult | undefined>();

  const fetch = async (parm: T) => {
    setContext({ type: ActionType.LoadingProcess, state: { enabled: true } });
    try {
      const respond = (await Fetcher.post(REST_PATH.search, parm)) as TUploadResult;
      setState(respond);
    } catch (e) {
      alert(e);
    }
    setContext({ type: ActionType.LoadingProcess, state: { enabled: false } });
  };

  useEffect(() => {
    fetch({ folder: '*' });
  }, []);

  return [state, fetch] as const;
};
export default useSearch;
