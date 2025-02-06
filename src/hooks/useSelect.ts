import Fetcher from 'lesca-fetcher';
import { useState } from 'react';
import { IRespond } from '../../setting';
import { REST_PATH } from '../settings/config';

type TArgument = { collection: string };

const useSelect = () => {
  const [state, setState] = useState<IRespond | undefined>();
  const fetch = async (argument: TArgument) => {
    const respond = (await Fetcher.post(REST_PATH.select, argument)) as IRespond;
    setState(respond);
  };
  return [state, fetch] as const;
};
export default useSelect;
