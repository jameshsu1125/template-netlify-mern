import { Context } from '@/settings/constant';
import { ActionType, AlertType } from '@/settings/type';
import { useCopyToClipboard } from '@uidotdev/usehooks';
import { memo, useCallback, useContext, useEffect, useState } from 'react';
import { FaFolder } from 'react-icons/fa6';
import { TUploadRespond } from '../../../setting/type';
import { AlbumContext } from './config';

type TTR = {
  item?: TUploadRespond;
  check: (check: boolean, public_id: string) => void;
};

type TSize = {
  width: number;
  height: number;
  resource: string;
};

const Size = memo(({ width, height, resource }: TSize) => {
  const [size, setSize] = useState({ width, height });

  useEffect(() => {
    const getImageSize = async () => {
      if (width === 0 && height === 0) {
        const img = new Image();
        img.src = resource;
        img.onload = () => {
          setSize({ width: img.width, height: img.height });
        };
      }
    };
    getImageSize();
  }, [width, height]);

  return (
    <div className='text-sm opacity-50'>
      {size.width === 0 && size.height === 0 ? 'unknown' : `${size.width}x${size.height}`}
    </div>
  );
});

const TR = memo(({ item, check }: TTR) => {
  const [, setContext] = useContext(Context);

  const [, setState] = useContext(AlbumContext);
  const [copiedText, copy] = useCopyToClipboard();

  const alertMessage = useCallback(
    (status: boolean) => {
      if (status) {
        setContext({
          type: ActionType.Alert,
          state: { enabled: true, body: '網址已經複製到剪貼簿', type: AlertType.Success },
        });
      } else {
        setContext({
          type: ActionType.Alert,
          state: { enabled: true, body: '剪貼簿功能不支援', type: AlertType.Error },
        });
      }
    },
    [setContext],
  );

  useEffect(() => {
    if (copiedText) {
      alertMessage(true);
      setContext({ type: ActionType.Album, state: { copiedText } });
      setContext({ type: ActionType.Modal, state: { enabled: false } });
    }
  }, [copiedText, alertMessage]);

  return (
    <tr key={JSON.stringify(item)}>
      <th>
        <label>
          {item && item?.resource_type !== 'folder' && (
            <input
              onChange={(e) => {
                check(e.target.checked, item.pixels === 0 ? item.secure_url : item.public_id);
              }}
              type='checkbox'
              className='checkbox border-2'
            />
          )}
        </label>
      </th>
      <td>
        <div className='flex items-center gap-3'>
          <div className='avatar'>
            <div className='mask mask-squircle flex h-20 w-20 items-center justify-center'>
              {item && item.resource_type !== 'folder' ? (
                <img
                  className='cursor-pointer'
                  onClick={() => {
                    window.open(item.secure_url, '_blank');
                  }}
                  src={item.secure_url}
                  alt={`${item.folder}/${item.filename}.${item.format}`}
                />
              ) : (
                <FaFolder
                  className='h-18 w-18 cursor-pointer'
                  onClick={() => {
                    setContext({
                      type: ActionType.Album,
                      state: { folder: item?.filename || '*' },
                    });
                  }}
                />
              )}
            </div>
          </div>
          <div>
            <div className='font-bold'>
              {!item
                ? '...'
                : `${item.folder}/${item.filename}${item.format ? `.${item.format}` : ''}`}
            </div>
            {item ? (
              <Size width={item.width} height={item.height} resource={item.secure_url} />
            ) : (
              'up folder...'
            )}
          </div>
        </div>
      </td>
      <th>
        <div className='join'>
          {!item ? (
            <button
              onClick={() => {
                setContext({
                  type: ActionType.Album,
                  state: { folder: '*' },
                });
              }}
              className='btn join-item btn-xs'
            >
              open
            </button>
          ) : item.resource_type === 'folder' ? (
            <>
              <button
                onClick={() => {
                  setContext({
                    type: ActionType.Album,
                    state: { folder: item.filename },
                  });
                }}
                className='btn join-item btn-xs'
              >
                open
              </button>
              <button
                onClick={() => {
                  setState((S) => ({
                    ...S,
                    enabled: true,
                    body: `Delete folder "${item.secure_url}" from cloudinary?`,
                    public_id: [item.secure_url],
                    submit: false,
                  }));
                }}
                className='btn join-item btn-xs'
              >
                delete
              </button>
            </>
          ) : (
            <>
              <button onClick={() => window.open(item.secure_url)} className='btn join-item btn-xs'>
                open
              </button>
              <button
                onClick={() => {
                  copy(item.secure_url);
                }}
                className='btn join-item btn-xs'
              >
                copy
              </button>
              <button
                onClick={() => {
                  setState((S) => ({
                    ...S,
                    enabled: true,
                    body: `Delete "${item.folder}/${item.filename}.${item.format}" from cloudinary?`,
                    public_id: [item.public_id],
                    submit: false,
                  }));
                }}
                className='btn join-item btn-xs'
              >
                delete
              </button>
            </>
          )}
        </div>
      </th>
    </tr>
  );
});
export default TR;
