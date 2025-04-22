import { Context } from '@/settings/constant';
import { UserType } from '@/settings/type';
import { useAuth0 } from '@auth0/auth0-react';
import { memo, useContext } from 'react';
import { FaPowerOff } from 'react-icons/fa';

const UserTypeName = {
  [UserType.Admin]: '管理員',
  [UserType.InHouse]: '內部人員',
  [UserType.User]: '使用者',
  [UserType.Guest]: '訪客',
};

const UserBar = memo(() => {
  const [context] = useContext(Context);
  const { user } = context;
  const { logout } = useAuth0();

  return (
    <div className='navbar bg-base-300 flex flex-row items-center justify-between px-3 select-none'>
      <div
        className='tooltip tooltip-bottom lg:tooltip-top text-xs'
        data-tip={UserTypeName[user.type]}
      >
        <div className='flex w-full flex-row items-center gap-2'>
          <div className='relative h-8 w-8'>
            <div
              className='bg-base-300 h-full w-full rounded-full bg-cover'
              style={{ backgroundImage: `url(${user.picture})` }}
            />
          </div>
          <div className='text-sm font-bold'>{user.name}</div>
        </div>
      </div>
      <div className='logout mr-2'>
        <div className='tooltip tooltip-bottom lg:tooltip-top' data-tip='登出'>
          <a className='cursor-pointer' onClick={() => logout()}>
            <FaPowerOff />
          </a>
        </div>
      </div>
    </div>
  );
});
export default UserBar;
