import { memo } from 'react';
import copy from 'copy-text-to-clipboard';
import { TUploadRespond } from '../../../setting/type';
import './index.less';

type T = {
  data: TUploadRespond[];
  remove: (public_id: string) => void;
  check: (check: boolean, public_id: string) => void;
};

const Table = memo(({ data, remove, check }: T) => {
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
                        <img src={item.url} alt='Avatar Tailwind CSS Component' />
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
                    <button onClick={() => window.open(item.url)} className='btn join-item btn-xs'>
                      open
                    </button>
                    <button
                      onClick={() => {
                        if (navigator.clipboard === undefined) {
                          if (copy(item.url)) alert('網址已經複製到剪貼簿');
                        } else {
                          navigator.clipboard?.writeText?.(item.url).then(
                            () => alert('網址已經複製到剪貼簿'),
                            () => alert('剪貼簿功能不支援'),
                          );
                        }
                      }}
                      className='btn join-item btn-xs'
                    >
                      copy
                    </button>
                    <button
                      onClick={() => {
                        remove(item.public_id);
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
        {/* foot */}
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
