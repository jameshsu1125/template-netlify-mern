import { Context } from '@/settings/constant';
import { IReactProps, UserType } from '@/settings/type';
import { useAuth0 } from '@auth0/auth0-react';
import { memo, useContext, useMemo } from 'react';
import { FaUserEdit } from 'react-icons/fa';
import { FaPowerOff, FaUserCheck, FaUserGear } from 'react-icons/fa6';
import { PiUserFocusBold, PiUserListFill } from 'react-icons/pi';
import { Link } from 'react-router-dom';
import { SETTING } from '../../../setting';
import './index.less';

const UserInfo = memo(({ children }: IReactProps) => {
  const { logout } = useAuth0();

  const [context] = useContext(Context);
  const { user } = context;

  const icon = useMemo(() => {
    switch (user.type) {
      case UserType.Admin:
        return <FaUserGear />;
      case UserType.inHouse:
        return <FaUserEdit />;
      case UserType.user:
        return <FaUserCheck />;
      default:
      case UserType.guest:
        return <PiUserFocusBold />;
    }
  }, [user.type]);

  return (
    <div className='UserInfo'>
      <div>
        <div className='flex flex-row items-center justify-center space-x-2 lg:w-full lg:flex-col lg:space-y-2'>
          <div className='photo'>
            <div style={{ backgroundImage: `url(${user.picture})` }} />
          </div>
          <div className='tooltip tooltip-bottom text-xs lg:tooltip-right' data-tip={user.type}>
            <div className='w-full'>{icon}</div>
          </div>
        </div>
        <div className='tools'>
          {user.type === UserType.Admin && (
            <div className='tooltip tooltip-bottom text-2xl lg:tooltip-right' data-tip='用戶列表'>
              <Link to={`/${SETTING.mongodb[0].collection}`}>
                <PiUserListFill />
              </Link>
            </div>
          )}
        </div>
        <div className='logout'>
          <div className='tooltip tooltip-bottom lg:tooltip-right' data-tip='登出'>
            <a className='cursor-pointer' onClick={() => logout()}>
              <FaPowerOff />
            </a>
          </div>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
});
export default UserInfo;
