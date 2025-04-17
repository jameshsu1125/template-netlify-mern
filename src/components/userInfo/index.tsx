import { Context } from '@/settings/constant';
import { IReactProps, UserType } from '@/settings/type';
import { useAuth0 } from '@auth0/auth0-react';
import { memo, useContext, useMemo } from 'react';
import { FaUserEdit } from 'react-icons/fa';
import { FaPowerOff, FaUserCheck, FaUserGear } from 'react-icons/fa6';
import { PiUserFocusBold, PiUserListFill } from 'react-icons/pi';
import { Link } from 'react-router-dom';
import { SETTING } from '../../../setting';

const UserInfo = memo(({ children }: IReactProps) => {
  const { logout } = useAuth0();

  const [context] = useContext(Context);
  const { user } = context;

  const icon = useMemo(() => {
    switch (user.type) {
      case UserType.Admin:
        return <FaUserGear />;
      case UserType.InHouse:
        return <FaUserEdit />;
      case UserType.User:
        return <FaUserCheck />;
      default:
      case UserType.Guest:
        return <PiUserFocusBold />;
    }
  }, [user.type]);

  return (
    <div className='flex h-full w-full flex-col items-start justify-start lg:flex-row'>
      <div className='bg-secondary flex h-12 w-full flex-row items-center justify-between px-2 py-4 lg:h-full lg:w-12 lg:flex-col'>
        <div className='flex flex-row items-center justify-center space-x-2 lg:w-full lg:flex-col lg:space-y-2'>
          <div className='relative h-8 w-8'>
            <div
              className='bg-base-300 h-full w-full rounded-full bg-cover'
              style={{ backgroundImage: `url(${user.picture})` }}
            />
          </div>
          <div className='tooltip tooltip-bottom lg:tooltip-right text-xs' data-tip={user.type}>
            <div className='w-full'>{icon}</div>
          </div>
        </div>
        <div className='flex w-full flex-col items-center justify-center'>
          {user.type === UserType.Admin && (
            <div className='tooltip tooltip-bottom lg:tooltip-right text-2xl' data-tip='用戶列表'>
              <Link to={`/${SETTING.mongodb[0].collection}`}>
                <PiUserListFill />
              </Link>
            </div>
          )}
        </div>
        <div className='llll'></div>
        <span className='loading loading-spinner loading-md'></span>
        <div className='logout'>
          <div className='tooltip tooltip-bottom lg:tooltip-right' data-tip='登出'>
            <a className='cursor-pointer' onClick={() => logout()}>
              <FaPowerOff />
            </a>
          </div>
        </div>
      </div>
      <div className='w-full flex-1 lg:h-full'>{children}</div>
    </div>
  );
});
export default UserInfo;
