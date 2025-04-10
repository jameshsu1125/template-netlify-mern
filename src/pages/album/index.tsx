import { memo, useEffect } from 'react';
import Album from '@/components/album';

const AlbumPage = memo(() => {
  useEffect(() => {}, []);
  return (
    <div className='w-full'>
      <Album />
    </div>
  );
});
export default AlbumPage;
