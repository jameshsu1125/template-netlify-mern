import { Context } from '@/settings/constant';
import { ActionType, AlertType } from '@/settings/type';
import { useCopyToClipboard } from '@uidotdev/usehooks';
import { memo, useContext } from 'react';
import { FaArrowUpRightFromSquare, FaCopy, FaPlus, FaXmark } from 'react-icons/fa6';
import { MdDeleteOutline } from 'react-icons/md';
import { AlbumContext } from './config';
import { useImageSize } from './item';

const Detail = memo(() => {
  const [, setContext] = useContext(Context);
  const [state, setState] = useContext(AlbumContext);
  const [, copy] = useCopyToClipboard();
  const item = state.detail;
  const size = useImageSize(item);
  if (!item) return null;

  const name = `${item.filename}${item.format && !item.filename.endsWith(`.${item.format}`) ? `.${item.format}` : ''}`;
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

  return (
    <aside className='bg-base-200 rounded-box flex w-full shrink-0 flex-col gap-3 p-4 lg:w-72'>
      <div className='flex items-start gap-2'>
        <h3 className='min-w-0 flex-1 font-bold break-all'>{name}</h3>
        <button
          type='button'
          className='btn btn-ghost btn-xs btn-square'
          aria-label='關閉'
          onClick={() => setState((S) => ({ ...S, detail: null }))}
        >
          <FaXmark />
        </button>
      </div>
      <img
        src={item.secure_url}
        alt={name}
        className='bg-base-300 rounded-box w-full object-contain'
      />
      <dl className='text-sm'>
        <dt className='opacity-50'>尺寸</dt>
        <dd className='mb-2'>
          {size.width && size.height ? `${size.width} × ${size.height}` : '讀取中…'}
        </dd>
        <dt className='opacity-50'>路徑</dt>
        <dd className='break-all'>{path}</dd>
      </dl>
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
      <div className='grid grid-cols-2 gap-2'>
        <a href={item.secure_url} target='_blank' rel='noreferrer' className='btn btn-sm'>
          <FaArrowUpRightFromSquare />
          開新分頁
        </a>
        <button
          type='button'
          className='btn btn-sm btn-error btn-outline'
          onClick={() =>
            setState((S) => ({
              ...S,
              confirm: {
                title: '刪除圖片',
                body: `確定要刪除「${name}」嗎？此動作無法復原。`,
                public_id: [item.public_id],
              },
            }))
          }
        >
          <MdDeleteOutline />
          刪除
        </button>
      </div>
    </aside>
  );
});
export default Detail;
