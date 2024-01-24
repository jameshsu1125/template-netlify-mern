import { IReactProps } from '@/settings/type';
import Panel from './panel';

const Tab = ({ children }: IReactProps) => (
  <div role='tablist' className='tabs tabs-lifted'>
    {children}
  </div>
);

Tab.Panel = Panel;

export default Tab;
