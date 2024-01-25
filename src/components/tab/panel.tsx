import { IReactProps } from '@/settings/type';
import { memo } from 'react';

type T = IReactProps & {
  label: string;
  id?: string;
};

const Panel = memo(({ id, children, label }: T) => (
  <>
    <input
      id={id}
      type='radio'
      name='tab'
      role='tab'
      className='tab'
      aria-label={label}
      defaultChecked
    />
    <div role='tabpanel' className='tab-content rounded-box border-base-300 bg-base-100 p-6'>
      {children}
    </div>
  </>
));
export default Panel;
