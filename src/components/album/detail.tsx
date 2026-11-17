import { Context } from '@/settings/constant';
import { ActionType, AlertType } from '@/settings/type';
import { useCopyToClipboard } from '@uidotdev/usehooks';
import { memo, useContext } from 'react';
import { FaArrowUpRightFromSquare, FaCopy, FaPlus, FaRegImage, FaXmark } from 'react-icons/fa6';
import { MdDeleteOutline } from 'react-icons/md';
import { AlbumContext, fileName } from './config';
import { useImageSize } from './item';

const PANEL = 'card card-border card-sm bg-base-100 w-full shrink-0 lg:sticky lg:top-0 lg:w-72';
// fixed height, so a tall or wide image never changes the panel size
const FIGURE = 'bg-base-200 relative h-48';

const Detail = memo(() => {
  const [, setContext] = useContext(Context);
  const [state, setState] = useContext(AlbumContext);
  const [, copy] = useCopyToClipboard();
  const item = state.detail;
  const size = useImageSize(item);
  // the panel is always on screen so picking an image never shifts the layout
  if (!item)
    return (
      <aside className={PANEL}>
        <figure className={FIGURE}>
          <FaRegImage className='text-base-content/25 size-12' />
        </figure>
        <div className='card-body'>
          <h3 className='card-title text-base-content/60 text-base'>圖片資訊</h3>
          <p className='text-base-content/60 text-sm'>點一張縮圖，這裡會顯示尺寸、路徑與操作。</p>
          <div className='card-actions flex-col items-stretch'>
            <button type='button' className='btn' disabled>
              {state.mode === 'picker' ? '插入' : '複製網址'}
            </button>
          </div>
        </div>
      </aside>
    );

  const name = fileName(item);
  const path = item.folder ? `${item.folder}/${name}` : name;

  const onCopy = async () => {
    try {
      await copy(item.secure_url);
      setContext({
        type: ActionType.Alert,
        state: { enabled: true, body: '網址已經複製到剪貼簿', type: AlertType.Success },
      });
    } catch {
      setContext({
        type: ActionType.Alert,
        state: { enabled: true, body: '剪貼簿功能不支援', type: AlertType.Error },
      });
    }
  };

  const onInsert = () => {
    setContext({ type: ActionType.Album, state: { copiedText: item.secure_url } });
    setContext({ type: ActionType.Modal, state: { enabled: false } });
  };

  const remove = () =>
    setState((S) => ({
      ...S,
      confirm: {
        title: '刪除圖片',
        body: `確定要刪除「${name}」嗎？此動作無法復原。`,
        public_id: [item.public_id],
      },
    }));

  return (
    <aside className={PANEL}>
      <figure className={FIGURE}>
        <img src={item.secure_url} alt={name} className='size-full object-contain' />
        <button
          type='button'
          className='btn btn-circle btn-sm absolute top-2 right-2'
          aria-label='關閉'
          onClick={() => setState((S) => ({ ...S, detail: null }))}
        >
          <FaXmark />
        </button>
      </figure>
      <div className='card-body'>
        <h3 className='card-title text-base break-all'>{name}</h3>
        <ul className='list -mx-3'>
          <li className='list-row py-2'>
            <span className='text-base-content/60 text-xs'>尺寸</span>
            <span className='text-sm'>
              {size.width && size.height ? (
                `${size.width} × ${size.height}`
              ) : (
                <span className='loading loading-dots loading-xs' />
              )}
            </span>
          </li>
          <li className='list-row py-2'>
            <span className='text-base-content/60 text-xs'>路徑</span>
            <span className='text-sm break-all'>{path}</span>
          </li>
        </ul>
        <div className='card-actions flex-col items-stretch'>
          {state.mode === 'picker' ? (
            <button type='button' className='btn btn-primary' onClick={onInsert}>
              <FaPlus />
              插入
            </button>
          ) : (
            <button type='button' className='btn btn-primary' onClick={onCopy}>
              <FaCopy />
              複製網址
            </button>
          )}
          <div className='join w-full'>
            <a
              href={item.secure_url}
              target='_blank'
              rel='noreferrer'
              className='btn btn-sm join-item flex-1'
            >
              <FaArrowUpRightFromSquare />
              開新分頁
            </a>
            <button
              type='button'
              className='btn btn-sm btn-error btn-soft join-item flex-1'
              onClick={remove}
            >
              <MdDeleteOutline />
              刪除
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
});
export default Detail;
