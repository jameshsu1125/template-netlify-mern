import { memo, useState } from 'react';
import './index.less';
import List from './list';
import Upload from './upload';

const Album = memo(() => {
  const [key, setKey] = useState(0);

  return (
    <div className='flex w-full flex-col p-5'>
      <div role='tablist' className='tabs tabs-lifted'>
        <input
          id='Manage'
          type='radio'
          name='tab'
          role='tab'
          className='tab'
          aria-label='Manage'
          defaultChecked
        />
        <div role='tabpanel' className='tab-content rounded-box border-base-300 bg-base-100 p-6'>
          <List key={key} reload={setKey} />
        </div>
        <input type='radio' name='tab' role='tab' className='tab' aria-label='Upload' />
        <div role='tabpanel' className='tab-content rounded-box border-base-300 bg-base-100 p-6'>
          <Upload reload={setKey} />
        </div>
      </div>
    </div>
  );
});
export default Album;
