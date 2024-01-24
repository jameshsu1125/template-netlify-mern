import { memo, useState } from 'react';
import Confirm from '../confirm';
import { AlbumContext, AlbumState } from './config';
import List from './list';
import Upload from './upload';

const Album = memo(() => {
  const value = useState(AlbumState);
  const [state, setState] = value;
  const [key, setKey] = useState(0);

  const height = window.innerHeight - (state.enabled ? 66 + 64 : 64) + 'px';

  return (
    <AlbumContext.Provider value={value}>
      {state.enabled && (
        <Confirm
          body={state.body}
          onCancel={() => {
            setState((S) => ({ ...S, enabled: false, submit: false }));
          }}
          onConfirm={() => {
            setState((S) => ({ ...S, enabled: false, submit: true }));
          }}
        />
      )}
      <div className='w-full overflow-scroll' style={{ height }}>
        <div className='relative flex w-full flex-col'>
          <div className='w-full p-5'>
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
              <div
                role='tabpanel'
                className='tab-content rounded-box border-base-300 bg-base-100 p-6'
              >
                <List key={key} reload={setKey} />
              </div>
              <input type='radio' name='tab' role='tab' className='tab' aria-label='Upload' />
              <div
                role='tabpanel'
                className='tab-content rounded-box border-base-300 bg-base-100 p-6'
              >
                <Upload reload={setKey} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AlbumContext.Provider>
  );
});
export default Album;
