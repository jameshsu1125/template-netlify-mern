import useSearch from '@/hooks/useSearch';
import { Context } from '@/settings/constant';
import { ActionType } from '@/settings/type';
import { memo, useContext, useEffect, useRef } from 'react';
import { MdDeleteOutline } from 'react-icons/md';
import { FaRegImages } from 'react-icons/fa6';
import { AlbumContext, fileName, folderNames, removeKey } from './config';
import Item from './item';

const MAX_AVATAR = 5;

const Grid = memo(() => {
  const [context] = useContext(Context);
  const [state, setState] = useContext(AlbumContext);
  const folder = context[ActionType.Album].folder;
  const [respond, fetch] = useSearch();

  // the folder the latest request was sent for
  const asked = useRef(folder);
  asked.current = folder;

  // a new folder starts with nothing selected
  useEffect(() => {
    setState((S) => ({ ...S, selected: [], detail: null }));
  }, [folder]);

  useEffect(() => {
    if (state.reload) fetch({ folder });
  }, [state.reload]);

  // the grid already knows the sub folders, hand them to the tree
  useEffect(() => {
    if (respond?.res && asked.current === folder) {
      const names = folderNames(respond.data);
      setState((S) => ({ ...S, tree: { ...S.tree, [folder]: names } }));
    }
  }, [respond]);

  const data = respond?.res ? respond.data || [] : [];
  // selected images in the order they were picked
  const picked = state.selected
    .map((key) => data.find((item) => removeKey(item) === key))
    .filter((item) => item !== undefined);

  return (
    <div className='flex min-w-0 flex-1 flex-col gap-3'>
      {state.selected.length > 0 && (
        <div role='status' className='alert alert-soft sticky top-0 z-10 shadow-sm'>
          <div className='avatar-group -space-x-4'>
            {picked.slice(0, MAX_AVATAR).map((item) => (
              <div key={removeKey(item)} className='avatar'>
                <div className='w-9'>
                  <img src={item.secure_url} alt={fileName(item)} />
                </div>
              </div>
            ))}
            {state.selected.length > MAX_AVATAR && (
              <div className='avatar avatar-placeholder'>
                <div className='bg-neutral text-neutral-content w-9'>
                  <span className='text-xs'>+{state.selected.length - MAX_AVATAR}</span>
                </div>
              </div>
            )}
          </div>
          <span>已選 {state.selected.length} 張</span>
          <div className='join'>
            <button
              type='button'
              className='btn btn-sm join-item'
              onClick={() => setState((S) => ({ ...S, selected: [] }))}
            >
              取消選取
            </button>
            <button
              type='button'
              className='btn btn-sm btn-error join-item'
              onClick={() =>
                setState((S) => ({
                  ...S,
                  confirm: {
                    title: '刪除圖片',
                    body: `確定要刪除選取的 ${S.selected.length} 張圖片嗎？此動作無法復原。`,
                    public_id: S.selected,
                  },
                }))
              }
            >
              <MdDeleteOutline />
              刪除
            </button>
          </div>
        </div>
      )}
      {respond && !respond.res && (
        <div role='alert' className='alert alert-error alert-soft'>
          {respond.msg || '讀取失敗'}
        </div>
      )}
      {respond?.res && data.length === 0 && (
        <div className='card card-dash bg-base-100'>
          <div className='card-body items-center py-12 text-center'>
            <FaRegImages className='text-base-content/30 size-10' />
            <h3 className='card-title text-base'>這個資料夾是空的</h3>
            <p className='text-base-content/60 text-sm'>把圖片拖到這裡，或按右上角的「上傳」</p>
          </div>
        </div>
      )}
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))]'>
        {data.map((item) => (
          <Item key={item.public_id || item.secure_url} item={item} />
        ))}
      </div>
    </div>
  );
});
export default Grid;
