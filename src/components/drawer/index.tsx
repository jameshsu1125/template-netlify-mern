import { IReactProps } from '@/settings/type';
import { memo } from 'react';
import { AiFillDatabase } from 'react-icons/ai';
import { BiSolidPhotoAlbum } from 'react-icons/bi';
import { BsTools } from 'react-icons/bs';
import { IoDocumentTextSharp } from 'react-icons/io5';
import { RiDatabaseLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { SETTING } from '../../../setting';

const Drawer = memo(({ children }: IReactProps) => {
  return (
    <div className='drawer lg:drawer-open'>
      <input id='my-drawer-2' type='checkbox' className='drawer-toggle' />
      <div className='drawer-content relative flex flex-col items-center justify-start pt-16'>
        {children}
      </div>
      <div className='drawer-side'>
        <label htmlFor='my-drawer-2' aria-label='close sidebar' className='drawer-overlay'></label>
        <ul className='menu relative min-h-full w-52 bg-base-200 p-4 text-base-content'>
          <div className='flex w-full flex-row items-center justify-start py-5'>
            <BsTools className='mr-1' />
            TOOLS
          </div>
          <li>
            <Link to='/album'>
              <BiSolidPhotoAlbum />
              Album
            </Link>
            <Link to='/editor'>
              <IoDocumentTextSharp />
              Editor
            </Link>
          </li>
          <div className='flex w-full flex-row items-center justify-start py-5'>
            <AiFillDatabase className='mr-1' />
            COLLECTION LIST
          </div>
          <li>
            {SETTING.mongodb
              .filter((_, index) => index !== 0)
              .map((collection) => {
                return (
                  <Link key={collection.collection} to={`/${collection.collection}`}>
                    <RiDatabaseLine />
                    {collection.collection}
                  </Link>
                );
              })}
          </li>
        </ul>
      </div>
    </div>
  );
});
export default Drawer;
