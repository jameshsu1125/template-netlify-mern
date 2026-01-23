import { memo, useContext, useEffect, useState } from 'react';
import { TUploadRespond } from '../../../setting/type';
import { FaFolder } from 'react-icons/fa6';
import { AlbumContext } from './config';
import { useCopyToClipboard } from '@uidotdev/usehooks';
import { Context } from '@/settings/constant';
import { ActionType, AlertType } from '@/settings/type';
import useRemove from '@/hooks/useRemove';

type TTR = {
  item?: TUploadRespond;
  reload?: React.Dispatch<React.SetStateAction<number>>;
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

const TR = memo(({ item, check, reload }: TTR) => {
  const [, setContext] = useContext(Context);

  const [, setState] = useContext(AlbumContext);
  const [, copy] = useCopyToClipboard();
  const [response, removeResource] = useRemove();

  useEffect(() => {
    if (response) {
      setContext({
        type: ActionType.Alert,
        state: {
          enabled: true,
          body: response.msg,
          type: response.res ? AlertType.Success : AlertType.Error,
        },
      });
      reload?.((S) => S + 1);
    }
  }, [response]);

  return (
    <tr key={JSON.stringify(item)}>
      <th>
        <label>
          {item && item?.resource_type !== 'folder' && (
            <input
              onChange={(e) => {
                check(e.target.checked, item.public_id);
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
                <a href={item.secure_url} target='_blank' rel='noreferrer'>
                  <img src={item.secure_url} alt='Avatar Tailwind CSS Component' />
                </a>
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
                  removeResource({ public_id: item.secure_url });
                }}
                className='btn join-item btn-xs'
              >
                remove
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
