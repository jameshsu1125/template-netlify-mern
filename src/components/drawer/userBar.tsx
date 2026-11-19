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
    <div className='border-base-300 flex w-full items-center gap-3 border-t p-3 select-none'>
      <div className='avatar'>
        <div className='ring-primary ring-offset-base-200 w-10 rounded-full ring-2 ring-offset-2'>
          <img src={user.picture} alt={user.name} />
        </div>
      </div>
      <div className='flex min-w-0 flex-1 flex-col items-start gap-1'>
        <div className='w-full truncate text-sm font-bold'>{user.name}</div>
        <div
          className={`badge badge-sm ${user.type === UserType.Admin ? 'badge-primary' : 'badge-ghost'}`}
        >
          {UserTypeName[user.type]}
        </div>
      </div>
      <div className='tooltip tooltip-left' data-tip='登出'>
        <button
          type='button'
          aria-label='登出'
          className='btn btn-ghost btn-sm btn-square'
          onClick={() => logout()}
        >
          <FaPowerOff />
        </button>
      </div>
    </div>
  );
});
export default UserBar;
