import { REST_PATH } from '@/settings/config';
import { Context } from '@/settings/constant';
import { ActionType } from '@/settings/type';
import { post } from '@/settings/fetcher';
import { useContext, useEffect, useState } from 'react';
import { TUploadResult } from '../../setting';

type T = {
  folder: string;
};

const useSearch = () => {
  const [content, setContext] = useContext(Context);
  const folder = content[ActionType.Album].folder;
  const [state, setState] = useState<TUploadResult | undefined>();

  const fetch = async (parm: T) => {
    setContext({ type: ActionType.LoadingProcess, state: { enabled: true } });
    try {
      const respond = await post<TUploadResult>(REST_PATH.search, parm);
      setState(respond);
    } catch (e) {
      alert(e);
    }
    setContext({ type: ActionType.LoadingProcess, state: { enabled: false } });
  };

  useEffect(() => {
    const initialFetch = async () => {
      await fetch({ folder });
    };
    initialFetch();
  }, [folder]);

  return [state, fetch] as const;
};
export default useSearch;
