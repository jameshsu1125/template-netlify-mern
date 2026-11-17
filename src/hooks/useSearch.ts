import { REST_PATH } from '@/settings/config';
import { Context } from '@/settings/constant';
import { ActionType } from '@/settings/type';
import { post } from '@/settings/fetcher';
import { useContext, useEffect, useState } from 'react';
import { TUploadResult } from '../../setting';

type T = {
  folder: string;
};

type TOption = {
  /** false: do not query `album.folder` on mount and whenever it changes */
  auto?: boolean;
  /** true: do not toggle the full screen LoadingProcess */
  silent?: boolean;
};

const useSearch = ({ auto = true, silent = false }: TOption = {}) => {
  const [content, setContext] = useContext(Context);
  const folder = content[ActionType.Album].folder;
  const [state, setState] = useState<TUploadResult | undefined>();

  const fetch = async (parm: T) => {
    if (!silent) setContext({ type: ActionType.LoadingProcess, state: { enabled: true } });
    let respond: TUploadResult | undefined;
    try {
      respond = await post<TUploadResult>(REST_PATH.search, parm);
      setState(respond);
    } catch (e) {
      if (!silent) alert(e);
    }
    if (!silent) setContext({ type: ActionType.LoadingProcess, state: { enabled: false } });
    return respond;
  };

  useEffect(() => {
    const initialFetch = async () => {
      await fetch({ folder });
    };
    if (auto) initialFetch();
  }, [folder]);

  return [state, fetch] as const;
};
export default useSearch;
