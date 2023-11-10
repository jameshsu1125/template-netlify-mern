import { IReactProps } from '@/settings/type';
import { memo } from 'react';
import { Link } from 'react-router-dom';
import { SETTING } from '../../../setting';

const Drawer = memo(({ children }: IReactProps) => (
  <div className='drawer lg:drawer-open'>
    <input id='my-drawer-2' type='checkbox' className='drawer-toggle' />
    <div className='drawer-content flex flex-col pt-16 items-center justify-center relative'>
      {children}
    </div>
    <div className='drawer-side'>
      <label htmlFor='my-drawer-2' aria-label='close sidebar' className='drawer-overlay'></label>
      <ul className='menu p-4 w-80 min-h-full bg-base-200 text-base-content'>
        {/* Sidebar content here */}
        <div className='w-full py-5'>COLLECTION LIST</div>
        <li>
          {SETTING.mongodb.map((collection) => {
            return (
              <Link key={collection.collection} to={`/${collection.collection}`}>
                {collection.collection}
              </Link>
            );
          })}
        </li>
      </ul>
    </div>
  </div>
));
export default Drawer;
