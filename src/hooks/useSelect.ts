import Fetcher from 'lesca-fetcher';
import { useContext, useState } from 'react';
import { REST_PATH } from '../settings/config';
import { Context } from '../settings/constant';
import { ActionType } from '@/settings/type';
import { IRespond } from '../../setting';

type TArgument = { collection: string };

const useSelect = () => {
  const [, setContext] = useContext(Context);
  const [state, setState] = useState<IRespond | undefined>();
  const fetch = async (argument: TArgument) => {
    setContext({ type: ActionType.LoadingProcess, state: { enabled: true } });
    const respond = (await Fetcher.post(REST_PATH.select, argument)) as IRespond;
    setState(respond);
    setContext({ type: ActionType.LoadingProcess, state: { enabled: false } });
  };
  return [state, fetch] as const;
};
export default useSelect;
