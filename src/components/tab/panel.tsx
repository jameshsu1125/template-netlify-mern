import { IReactProps } from '@/settings/type';
import { memo } from 'react';

type T = IReactProps & {
  label: string;
};

const Panel = memo(({ children, label }: T) => (
  <>
    <input type='radio' name='tab' role='tab' className='tab' aria-label={label} defaultChecked />
    <div role='tabpanel' className='tab-content rounded-box border-base-300 bg-base-100 p-6'>
      {children}
    </div>
  </>
));
export default Panel;
