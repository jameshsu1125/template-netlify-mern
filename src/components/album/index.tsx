import { memo, useState } from 'react';
import Confirm from '../confirm';
import { AlbumContext, AlbumState } from './config';
import List from './list';
import Upload from './upload';
import Tab from '../tab';

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
            <Tab>
              <Tab.Panel id='Manage' label='Manage' defaultChecked>
                <List key={key} reload={setKey} />
              </Tab.Panel>
              <Tab.Panel label='Upload'>
                <Upload reload={setKey} />
              </Tab.Panel>
            </Tab>
          </div>
        </div>
      </div>
    </AlbumContext.Provider>
  );
});
export default Album;
