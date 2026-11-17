import { Context } from '@/settings/constant';
import { ActionType } from '@/settings/type';
import { memo, useContext, useEffect, useState } from 'react';
import { FaEllipsisVertical, FaFolder } from 'react-icons/fa6';
import { twMerge } from 'tailwind-merge';
import { TUploadRespond } from '../../../setting/type';
import { AlbumContext, joinPath, removeKey } from './config';

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

  return (
    <div className='group bg-base-200 hover:bg-base-300 rounded-box relative flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 p-2'>
      <div
        className='flex h-full w-full flex-col items-center justify-center gap-2'
        onClick={() =>
          setContext({ type: ActionType.Album, state: { folder: joinPath(folder, item.filename) } })
        }
      >
        <FaFolder className='text-warning h-12 w-12' />
        <span className='w-full truncate text-center text-sm'>{item.filename}</span>
      </div>
      <div className='dropdown dropdown-end absolute top-1 right-1'>
        <button
          type='button'
          tabIndex={0}
          className='btn btn-ghost btn-xs btn-square'
          aria-label='更多'
        >
          <FaEllipsisVertical />
        </button>
        <ul tabIndex={0} className='menu dropdown-content rounded-box bg-base-100 z-10 w-32 shadow'>
          <li>
            <a
              className='text-error'
              onClick={() =>
                setState((S) => ({
                  ...S,
                  confirm: {
                    title: '刪除資料夾',
                    body: `確定要刪除資料夾「${item.filename}」與裡面所有的檔案嗎？`,
                    // folders carry a trailing slash, the only signal the backend uses
                    public_id: [item.public_id],
                  },
                }))
              }
            >
              刪除資料夾
            </a>
          </li>
        </ul>
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
  const toggle = () =>
    setState((S) => ({
      ...S,
      selected: S.selected.includes(key)
        ? S.selected.filter((k) => k !== key)
        : [...S.selected, key],
    }));

  return (
    <div
      className={twMerge(
        'bg-base-200 rounded-box relative aspect-square cursor-pointer overflow-hidden transition',
        active ? 'outline-base-content outline-2 outline-offset-2 outline-dashed' : '',
        checked ? 'ring-primary ring-offset-base-100 ring-4 ring-offset-2' : '',
      )}
      onClick={() => setState((S) => ({ ...S, detail: item }))}
    >
      <img
        src={item.secure_url}
        alt={item.filename}
        loading='lazy'
        className={twMerge('h-full w-full object-cover transition', checked ? 'scale-90' : '')}
      />
      {checked && <div className='bg-primary/25 pointer-events-none absolute inset-0' />}
      <button
        type='button'
        role='checkbox'
        aria-checked={checked}
        aria-label={
          checked ? `取消選取 ${item.filename}（第 ${order} 張）` : `選取 ${item.filename}`
        }
        className={twMerge(
          'absolute top-2 left-2 flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold shadow transition',
          checked
            ? 'bg-primary text-primary-content border-primary-content'
            : 'bg-base-100/70 border-base-100 hover:bg-base-100',
        )}
        onClick={(e) => {
          e.stopPropagation();
          toggle();
        }}
      >
        {checked ? order : ''}
      </button>
      <div className='bg-base-100/80 absolute right-0 bottom-0 left-0 truncate px-2 py-1 text-xs'>
        {item.filename}
        {item.format && !item.filename.endsWith(`.${item.format}`) ? `.${item.format}` : ''}
      </div>
    </div>
  );
});

const Item = memo(({ item }: { item: TUploadRespond }) =>
  item.resource_type === 'folder' ? <FolderItem item={item} /> : <ImageItem item={item} />,
);
export default Item;
