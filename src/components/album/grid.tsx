import useSearch from '@/hooks/useSearch';
import { Context } from '@/settings/constant';
import { ActionType } from '@/settings/type';
import { memo, useContext, useEffect, useRef } from 'react';
import { MdDeleteOutline } from 'react-icons/md';
import { AlbumContext, folderNames, removeKey } from './config';
import Item from './item';

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

  return (
    <div className='flex min-w-0 flex-1 flex-col gap-3'>
      {state.selected.length > 0 && (
        <div className='bg-neutral text-neutral-content rounded-box sticky top-0 z-10 flex items-center gap-2 px-4 py-2'>
          <span className='shrink-0 text-sm'>已選 {state.selected.length} 張</span>
          <div className='flex min-w-0 flex-1 gap-2 overflow-x-auto py-1'>
            {state.selected.map((key, index) => {
              const picked = data.find((item) => removeKey(item) === key);
              return (
                <div key={key} className='indicator shrink-0' title={picked?.filename}>
                  <span className='indicator-item badge badge-primary badge-xs font-bold'>
                    {index + 1}
                  </span>
                  {picked ? (
                    <img
                      src={picked.secure_url}
                      alt={picked.filename}
                      className='rounded-field h-8 w-8 object-cover'
                    />
                  ) : (
                    <div className='rounded-field bg-base-300 h-8 w-8' />
                  )}
                </div>
              );
            })}
          </div>
          <button
            type='button'
            className='btn btn-error btn-sm'
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
          <button
            type='button'
            className='btn btn-ghost btn-sm'
            onClick={() => setState((S) => ({ ...S, selected: [] }))}
          >
            取消選取
          </button>
        </div>
      )}
      {respond && !respond.res && (
        <div role='alert' className='alert alert-error alert-soft'>
          {respond.msg || '讀取失敗'}
        </div>
      )}
      {respond?.res && data.length === 0 && (
        <div className='text-base-content/50 rounded-box border-base-300 flex min-h-48 items-center justify-center border-2 border-dashed text-sm'>
          這個資料夾是空的，把圖片拖到這裡或按「上傳」
        </div>
      )}
      <div className='grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3'>
        {data.map((item) => (
          <Item key={item.public_id || item.secure_url} item={item} />
        ))}
      </div>
    </div>
  );
});
export default Grid;
