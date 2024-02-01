import { memo, useCallback, useContext, useEffect } from 'react';
import { TUploadRespond } from '../../../setting/type';
import { Context } from '@/settings/constant';
import { ActionType, AlertType } from '@/settings/type';
import { AlbumContext } from './config';
import { useCopyToClipboard } from '@uidotdev/usehooks';

type T = {
  data: TUploadRespond[];
  check: (check: boolean, public_id: string) => void;
};

const Table = memo(({ data, check }: T) => {
  const [, setContext] = useContext(Context);
  const [, setState] = useContext(AlbumContext);
  const [copiedText, copy] = useCopyToClipboard();

  const alertMessage = useCallback((status: boolean) => {
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
  }, []);

  useEffect(() => {
    if (copiedText) alertMessage(true);
  }, [copiedText]);

  return (
    <div className='overflow-x-auto'>
      <table className='table'>
        <thead>
          <tr>
            <th></th>
            <th>image information</th>
            <th>action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => {
            return (
              <tr key={JSON.stringify(item)}>
                <th>
                  <label>
                    <input
                      onChange={(e) => {
                        check(e.target.checked, item.public_id);
                      }}
                      type='checkbox'
                      className='checkbox border-2'
                    />
                  </label>
                </th>
                <td>
                  <div className='flex items-center gap-3'>
                    <div className='avatar'>
                      <div className='mask mask-squircle h-20 w-20'>
                        <img src={item.secure_url} alt='Avatar Tailwind CSS Component' />
                      </div>
                    </div>
                    <div>
                      <div className='font-bold'>
                        {item.folder}/{item.filename}.{item.format}
                      </div>
                      <div className='text-sm opacity-50'>
                        {item.width}x{item.height}
                      </div>
                    </div>
                  </div>
                </td>
                <th>
                  <div className='join'>
                    <button
                      onClick={() => window.open(item.secure_url)}
                      className='btn join-item btn-xs'
                    >
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
                  </div>
                </th>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <th></th>
            <th>image information</th>
            <th>action</th>
          </tr>
        </tfoot>
      </table>
    </div>
  );
});
export default Table;
