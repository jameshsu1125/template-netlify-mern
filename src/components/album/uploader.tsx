import useUpload from '@/hooks/useUpload';
import { CAPTURE_PROPERTY } from '@/settings/config';
import { Context } from '@/settings/constant';
import { ActionType } from '@/settings/type';
import { memo, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { FaCheck, FaFolderPlus, FaUpload, FaXmark } from 'react-icons/fa6';
import { twMerge } from 'tailwind-merge';
import { AlbumContext, dropTree, joinPath, TQueueItem } from './config';

/** shrink to CAPTURE_PROPERTY.maxWidth and encode as jpeg, same rule the old capture button used */
const compressFile = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, CAPTURE_PROPERTY.maxWidth / img.naturalWidth);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', CAPTURE_PROPERTY.compress));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('無法讀取圖片'));
    };
    img.src = url;
  });

const toStorageFolder = (folder: string) => (folder === '*' ? '' : folder);

/** returns a function that queues files for upload into a folder ('*' for root) */
const useEnqueue = () => {
  const [, setState] = useContext(AlbumContext);
  return async (files: FileList | File[], folder: string) => {
    const images = Array.from(files).filter((file) => file.type.startsWith('image/'));
    const items = await Promise.all(
      images.map(async (file): Promise<TQueueItem> => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        try {
          const base64 = await compressFile(file);
          return {
            id,
            name: file.name,
            base64,
            folder: toStorageFolder(folder),
            status: 'waiting',
          };
        } catch (e) {
          return { id, name: file.name, base64: '', folder, status: 'error', msg: String(e) };
        }
      }),
    );
    if (items.length) setState((S) => ({ ...S, queue: [...S.queue, ...items] }));
  };
};

const FileButton = ({
  className,
  children,
  onFiles,
  inputRef,
}: {
  className?: string;
  children: ReactNode;
  onFiles: (files: FileList) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}) => (
  <label className={twMerge('btn btn-sm', className)}>
    {children}
    <input
      ref={inputRef}
      type='file'
      accept='image/*'
      multiple
      className='hidden'
      onChange={(e) => {
        if (e.target.files?.length) onFiles(e.target.files);
        e.target.value = '';
      }}
    />
  </label>
);

export const UploadButton = memo(() => {
  const [context] = useContext(Context);
  const enqueue = useEnqueue();
  return (
    <FileButton
      className='btn-primary'
      onFiles={(files) => enqueue(files, context[ActionType.Album].folder)}
    >
      <FaUpload />
      上傳
    </FileButton>
  );
});

export const NewFolderButton = memo(() => {
  const [context] = useContext(Context);
  const [, setState] = useContext(AlbumContext);
  const enqueue = useEnqueue();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const folder = context[ActionType.Album].folder;
  const value = name.trim();
  const error = !value ? '' : value.includes('/') ? '名稱不能包含 /' : '';

  return (
    <>
      <button type='button' className='btn btn-sm' onClick={() => setOpen(true)}>
        <FaFolderPlus />
        新資料夾
      </button>
      {open && (
        <dialog className='modal modal-open z-50' open>
          <div className='modal-box'>
            <h3 className='text-lg font-bold'>新資料夾</h3>
            <p className='py-2 text-sm opacity-70'>
              儲存空間沒有空資料夾，建立時要同時上傳第一批圖片。
            </p>
            <input
              autoFocus
              className={twMerge('input w-full', error ? 'input-error' : '')}
              placeholder='資料夾名稱'
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {error && <p className='text-error mt-1 text-sm'>{error}</p>}
            <div className='modal-action'>
              <button type='button' className='btn btn-ghost' onClick={() => setOpen(false)}>
                取消
              </button>
              <FileButton
                inputRef={fileRef}
                className={twMerge('btn-md btn-primary', !value || error ? 'btn-disabled' : '')}
                onFiles={(files) => {
                  enqueue(files, joinPath(folder, value));
                  setState((S) => ({ ...S, tree: dropTree(S.tree, folder) }));
                  setName('');
                  setOpen(false);
                }}
              >
                選擇圖片並建立
              </FileButton>
            </div>
          </div>
          <div className='modal-backdrop' onClick={() => setOpen(false)} />
        </dialog>
      )}
    </>
  );
});

export const DropZone = memo(({ children }: { children: ReactNode }) => {
  const [context] = useContext(Context);
  const enqueue = useEnqueue();
  const [over, setOver] = useState(false);
  const depth = useRef(0);
  const folder = context[ActionType.Album].folder;

  return (
    <div
      className='relative flex min-w-0 flex-1'
      onDragEnter={(e) => {
        if (!e.dataTransfer.types.includes('Files')) return;
        depth.current += 1;
        setOver(true);
      }}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes('Files')) e.preventDefault();
      }}
      onDragLeave={() => {
        depth.current = Math.max(0, depth.current - 1);
        if (depth.current === 0) setOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        depth.current = 0;
        setOver(false);
        if (e.dataTransfer.files.length) enqueue(e.dataTransfer.files, folder);
      }}
    >
      {children}
      {over && (
        <div className='bg-primary/10 border-primary text-primary rounded-box pointer-events-none absolute inset-0 z-20 flex items-center justify-center border-2 border-dashed font-bold'>
          放開以上傳到「{folder === '*' ? '相簿' : folder}」
        </div>
      )}
    </div>
  );
});

/** uploads the queue one by one and shows each item's state */
export const UploadQueue = memo(() => {
  const [state, setState] = useContext(AlbumContext);
  const [, upload] = useUpload({ silent: true });
  const busy = useRef(false);
  const { queue } = state;

  const patch = (id: string, value: Partial<TQueueItem>) =>
    setState((S) => ({
      ...S,
      queue: S.queue.map((item) => (item.id === id ? { ...item, ...value } : item)),
    }));

  useEffect(() => {
    if (busy.current) return;
    const next = queue.find((item) => item.status === 'waiting');
    if (!next) return;
    busy.current = true;
    patch(next.id, { status: 'uploading' });
    upload({ image: next.base64, folder: next.folder }).then((respond) => {
      busy.current = false;
      patch(
        next.id,
        respond.res
          ? { status: 'done', msg: undefined }
          : { status: 'error', msg: String(respond.msg) },
      );
      // last one finished: show the new files
      setState((S) =>
        S.queue.some((item) => item.status === 'waiting')
          ? S
          : { ...S, reload: S.reload + 1, tree: {} },
      );
    });
  }, [queue]);

  if (!queue.length) return null;
  const finished = queue.every((item) => item.status === 'done' || item.status === 'error');
  const doneCount = queue.filter((item) => item.status === 'done').length;

  return (
    <div className='card bg-base-100 fixed right-4 bottom-4 z-50 w-80 shadow-xl'>
      <div className='card-body gap-2 p-4'>
        <div className='flex items-center'>
          <h3 className='flex-1 text-sm font-bold'>
            上傳 {doneCount}/{queue.length}
          </h3>
          {finished && (
            <button
              type='button'
              className='btn btn-ghost btn-xs btn-square'
              aria-label='關閉'
              onClick={() => setState((S) => ({ ...S, queue: [] }))}
            >
              <FaXmark />
            </button>
          )}
        </div>
        <progress className='progress progress-primary' value={doneCount} max={queue.length} />
        <ul className='max-h-48 overflow-y-auto text-sm'>
          {queue.map((item) => (
            <li key={item.id} className='flex items-center gap-2 py-1'>
              <span className='min-w-0 flex-1 truncate'>{item.name}</span>
              {item.status === 'waiting' && <span className='text-xs opacity-50'>等待</span>}
              {item.status === 'uploading' && (
                <span className='loading loading-spinner loading-xs' />
              )}
              {item.status === 'done' && <FaCheck className='text-success' />}
              {item.status === 'error' && (
                <>
                  <span className='text-error max-w-28 truncate text-xs' title={item.msg}>
                    {item.msg || '失敗'}
                  </span>
                  {item.base64 && (
                    <button
                      type='button'
                      className='btn btn-xs'
                      onClick={() => patch(item.id, { status: 'waiting', msg: undefined })}
                    >
                      重試
                    </button>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});
