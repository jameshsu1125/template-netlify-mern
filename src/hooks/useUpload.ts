import { REST_PATH } from '@/settings/config';
import { Context } from '@/settings/constant';
import { ActionType } from '@/settings/type';
import { post } from '@/settings/fetcher';
import { useContext, useState } from 'react';
import { IRespond } from '../../setting';

type T = { image: string; folder: string };
type TOption = {
  /** true: do not toggle the full screen LoadingProcess, and never throw */
  silent?: boolean;
};

const useUpload = ({ silent = false }: TOption = {}) => {
  const [, setContext] = useContext(Context);
  const [state, setState] = useState<IRespond | undefined>();
  const fetch = async (parm: T) => {
    if (!silent) setContext({ type: ActionType.LoadingProcess, state: { enabled: true } });
    let respond: IRespond;
    try {
      respond = await post<IRespond>(REST_PATH.upload, parm);
    } catch (e) {
      if (!silent) {
        setContext({ type: ActionType.LoadingProcess, state: { enabled: false } });
        throw e;
      }
      respond = { res: false, msg: String(e), collection: '', data: [] } as unknown as IRespond;
    }
    setState(respond);
    if (!silent) setContext({ type: ActionType.LoadingProcess, state: { enabled: false } });
    return respond;
  };
  return [state, fetch] as const;
};
export default useUpload;
