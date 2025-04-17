import { memo } from 'react';
import './index.less';
import List from './list';

const Album = memo(() => {
  return (
    <div className='Album'>
      <List />
    </div>
  );
});
export default Album;
