import { IReactProps } from '@/settings/type';
import { memo, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import MainBar from './mainBar';
import NavBar, { NavBarMobile } from './navBar';
import UserBar from './userBar';

const Drawer = memo(({ children }: IReactProps) => {
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const ref = useRef(location.pathname);

  useEffect(() => {
    if (ref.current !== location.pathname) {
      ref.current = location.pathname;
      if (inputRef.current?.checked) {
        inputRef.current?.click();
      }
    }
  }, [location.pathname]);

  return (
    <div className='drawer lg:drawer-open'>
      <input ref={inputRef} id='my-drawer-2' type='checkbox' className='drawer-toggle' />
      <div className='drawer-content'>
        <div className='w-full lg:hidden'>
          <NavBarMobile />
        </div>
        <div className='min-h-full w-full p-5'>{children}</div>
      </div>
      <div className='drawer-side'>
        <label htmlFor='my-drawer-2' aria-label='close sidebar' className='drawer-overlay'></label>
        <div className='bg-base-200 flex min-h-full w-full flex-col items-center justify-between overflow-hidden'>
          <div className='flex w-full flex-col justify-start'>
            <NavBar />
            <MainBar />
          </div>
          <UserBar />
        </div>
      </div>
    </div>
  );
});
export default Drawer;
