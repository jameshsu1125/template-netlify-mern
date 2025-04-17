import { memo } from 'react';
import { AiFillDatabase } from 'react-icons/ai';
import { BiSolidPhotoAlbum } from 'react-icons/bi';
import { BsTools } from 'react-icons/bs';
import { IoDocumentTextSharp } from 'react-icons/io5';
import { RiDatabaseLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { SETTING } from '../../../setting';

const MainBar = memo(() => (
  <ul className='menu text-base-content relative min-h-full w-80 p-4 select-none'>
    <div className='flex w-full flex-row items-center justify-start pb-5'>
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
));
export default MainBar;
