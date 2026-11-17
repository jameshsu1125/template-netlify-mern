import { Context } from '@/settings/constant';
import { ActionType } from '@/settings/type';
import { memo, useContext, useEffect, useState } from 'react';
import { FaEllipsisVertical, FaFolder } from 'react-icons/fa6';
import { twMerge } from 'tailwind-merge';
import { TUploadRespond } from '../../../setting/type';
import { MdDeleteOutline } from 'react-icons/md';
import { AlbumContext, fileName, joinPath, removeKey } from './config';

/** BunnyCDN answers width/height 0, measure them in the browser instead */
export const useImageSize = (item: TUploadRespond | null) => {
  const [measured, setMeasured] = useState({ url: '', width: 0, height: 0 });
  useEffect(() => {
    if (!item || item.width || item.height) return;
    const img = new Image();
    img.onload = () =>
      setMeasured({ url: item.secure_url, width: img.naturalWidth, height: img.naturalHeight });
    img.src = item.secure_url;
  }, [item]);
  if (!item) return { width: 0, height: 0 };
  if (item.width || item.height) return { width: item.width, height: item.height };
  return measured.url === item.secure_url ? measured : { width: 0, height: 0 };
};

const FolderItem = memo(({ item }: { item: TUploadRespond }) => {
  const [context, setContext] = useContext(Context);
  const [, setState] = useContext(AlbumContext);
  const folder = context[ActionType.Album].folder;
  const open = () =>
    setContext({ type: ActionType.Album, state: { folder: joinPath(folder, item.filename) } });

  return (
    <div className='card card-sm card-border bg-base-100 hover:bg-base-200 transition-colors'>
      <figure className='bg-base-200 aspect-square cursor-pointer' onClick={open}>
        <FaFolder className='text-base-content/40 size-14' />
      </figure>
      <div className='card-body flex-row items-center gap-1 px-3 py-2'>
        <button
          type='button'
          className='min-w-0 flex-1 cursor-pointer truncate text-left text-sm font-medium'
          title={item.filename}
          onClick={open}
        >
          {item.filename}
        </button>
        <details className='dropdown dropdown-end'>
          <summary className='btn btn-ghost btn-xs btn-square' aria-label='更多'>
            <FaEllipsisVertical />
          </summary>
          <ul className='menu dropdown-content bg-base-100 rounded-box z-10 w-36 p-2 shadow-sm'>
            <li>
              <button
                type='button'
                className='text-error'
                onClick={(e) => {
                  e.currentTarget.closest('details')?.removeAttribute('open');
                  setState((S) => ({
                    ...S,
                    confirm: {
                      title: '刪除資料夾',
                      body: `確定要刪除資料夾「${item.filename}」與裡面所有的檔案嗎？`,
                      // folders carry a trailing slash, the only signal the backend uses
                      public_id: [item.public_id],
                    },
                  }));
                }}
              >
                <MdDeleteOutline />
                刪除資料夾
              </button>
            </li>
          </ul>
        </details>
      </div>
    </div>
  );
});

const ImageItem = memo(({ item }: { item: TUploadRespond }) => {
  const [state, setState] = useContext(AlbumContext);
  const key = removeKey(item);
  // 1-based order in which the image was picked, 0 when not picked
  const order = state.selected.indexOf(key) + 1;
  const checked = order > 0;
  const active = state.detail?.secure_url === item.secure_url;
  const name = fileName(item);

  return (
    <div className='indicator w-full'>
      {checked && (
        <span className='indicator-item indicator-start badge badge-primary z-[1] size-7 rounded-full p-0 font-bold shadow-sm'>
          {order}
        </span>
      )}
      <div
        className={twMerge(
          'card card-sm card-border bg-base-100 w-full cursor-pointer transition-shadow',
          checked ? 'border-primary ring-primary ring-2' : '',
          active && !checked ? 'border-base-content/40 ring-base-content/40 ring-2' : '',
        )}
        onClick={() => setState((S) => ({ ...S, detail: item }))}
      >
        <figure className='bg-base-200 aspect-square'>
          <img src={item.secure_url} alt={name} loading='lazy' className='size-full object-cover' />
        </figure>
        <div className='card-body flex-row items-center gap-2 px-3 py-2'>
          <input
            type='checkbox'
            className='checkbox checkbox-sm checkbox-primary'
            aria-label={checked ? `取消選取 ${name}（第 ${order} 張）` : `選取 ${name}`}
            checked={checked}
            onClick={(e) => e.stopPropagation()}
            onChange={() =>
              setState((S) => ({
                ...S,
                selected: S.selected.includes(key)
                  ? S.selected.filter((k) => k !== key)
                  : [...S.selected, key],
              }))
            }
          />
          <span className='min-w-0 flex-1 truncate text-sm' title={name}>
            {name}
          </span>
        </div>
      </div>
    </div>
  );
});

const Item = memo(({ item }: { item: TUploadRespond }) =>
  item.resource_type === 'folder' ? <FolderItem item={item} /> : <ImageItem item={item} />,
);
export default Item;
