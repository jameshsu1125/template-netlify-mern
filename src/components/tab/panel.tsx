import { IReactProps } from '@/settings/type';
import { memo } from 'react';

type T = IReactProps & {
  label: string;
  id?: string;
  defaultChecked?: boolean;
};

const Panel = memo(({ id, children, label, defaultChecked = false }: T) => (
  <>
    <input
      id={id}
      type='radio'
      name='tab'
      role='tab'
      className='tab text-nowrap'
      aria-label={label}
      defaultChecked={defaultChecked}
    />
    <div role='tabpanel' className='tab-content rounded-box border-base-300 bg-base-100 p-6'>
      {children}
    </div>
  </>
));
export default Panel;
