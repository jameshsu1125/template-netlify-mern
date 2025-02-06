import { memo, useContext, useEffect, useMemo } from 'react';
import './index.less';
import { IReactProps, UserType } from '@/settings/type';
import { Context } from '@/settings/constant';
import { FaPowerOff, FaUserGear } from 'react-icons/fa6';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
import { SETTING } from '../../../setting';
import { RiDatabaseLine } from 'react-icons/ri';

const User = memo(({ children }: IReactProps) => {
  const [context, setContext] = useContext(Context);
  const { user } = context;

  const { logout } = useAuth0();

  const icon = useMemo(() => {
    switch (user.type) {
      case UserType.Admin:
        return <FaUserGear />;
      case UserType.inHouse:
        return <FaPowerOff />;
      case UserType.user:
        return <FaPowerOff />;
      case UserType.guest:
        return <FaPowerOff />;
    }
  }, [user.type]);

  useEffect(() => {}, []);
  return (
    <div className='User'>
      <div>
        <div className='flex w-full flex-col items-center justify-center space-y-2'>
          <div className='photo'>
            <div style={{ backgroundImage: `url(${user.picture})` }} />
          </div>
          <div className='tooltip text-xs' data-tip={user.type}>
            <div className='w-full'>{icon}</div>
          </div>
        </div>
        <div className='tools'>
          <Link to={`/${SETTING.mongodb[0].collection}`}>
            <RiDatabaseLine />
          </Link>
        </div>
        <div className='logout'>
          <div className='tooltip' data-tip='登出'>
            <a className='cursor-pointer'>
              <FaPowerOff />
            </a>
          </div>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
});
export default User;
