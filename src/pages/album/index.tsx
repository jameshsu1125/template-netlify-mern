import { memo, useEffect } from 'react';
import './index.less';
import Album from '@/components/album';

const AlbumPage = memo(() => {
  useEffect(() => {}, []);
  return (
    <div className='AlbumPage'>
      <Album />
    </div>
  );
});
export default AlbumPage;
