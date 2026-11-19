import { Context } from '@/settings/constant';
import { UserType } from '@/settings/type';
import { memo, useContext } from 'react';
import { BiSolidPhotoAlbum } from 'react-icons/bi';
import { IoDocumentTextSharp } from 'react-icons/io5';
import { PiUserListFill } from 'react-icons/pi';
import { RiDatabaseLine } from 'react-icons/ri';
import { Link, useLocation } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { SETTING } from '../../../setting';

type TItem = { to: string; label: string; icon: React.ReactNode };

const TOOLS: TItem[] = [
  { to: '/album', label: 'Album', icon: <BiSolidPhotoAlbum /> },
  { to: '/editor', label: 'Editor', icon: <IoDocumentTextSharp /> },
];

// index 0 是使用者資料表，改由「管理」區塊顯示（僅 admin）
const COLLECTIONS: TItem[] = SETTING.mongodb
  .filter((_, index) => index !== 0)
  .map(({ collection }) => ({ to: `/${collection}`, label: collection, icon: <RiDatabaseLine /> }));

const MainBar = memo(() => {
  const [context] = useContext(Context);
  const { pathname } = useLocation();
  const isAdmin = context.user.type === UserType.Admin;

  const renderItems = (items: TItem[]) =>
    items.map(({ to, label, icon }) => (
      <li key={to}>
        <Link to={to} className={twMerge(pathname === to && 'menu-active')}>
          {icon}
          {label}
        </Link>
      </li>
    ));

  return (
    <ul className='menu w-full flex-1 gap-0.5 overflow-y-auto p-3 select-none'>
      <li className='menu-title'>工具</li>
      {renderItems(TOOLS)}
      {COLLECTIONS.length > 0 && (
        <>
          <li className='menu-title mt-3'>資料</li>
          {renderItems(COLLECTIONS)}
        </>
      )}
      {isAdmin && (
        <>
          <li className='menu-title mt-3'>管理</li>
          {renderItems([
            {
              to: `/${SETTING.mongodb[0].collection}`,
              label: '使用者列表',
              icon: <PiUserListFill />,
            },
          ])}
        </>
      )}
    </ul>
  );
});
export default MainBar;
