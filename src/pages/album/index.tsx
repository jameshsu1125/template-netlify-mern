import Album from '@/components/album';
import { memo } from 'react';

const AlbumPage = memo(() => (
  <div className='w-full'>
    <Album />
  </div>
));
export default AlbumPage;
