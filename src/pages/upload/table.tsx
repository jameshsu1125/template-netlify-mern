import { memo, useEffect } from 'react';
import './index.less';
import { TUploadRespond } from '../../../setting/type';

type T = {
  data: TUploadRespond[];
};

const Table = memo(({ data }: T) => {
  useEffect(() => {
    console.log(data);
  }, []);
  return (
    <div className='overflow-x-auto'>
      <table className='table'>
        {/* head */}
        <thead>
          <tr>
            <th>
              <label>
                <input type='checkbox' className='checkbox' />
              </label>
            </th>
            <th>image information</th>
            <th>URL</th>
            <th>folder</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {/* row 1 */}
          {data.map((item) => {
            return (
              <tr key={JSON.stringify(item)}>
                <th>
                  <label>
                    <input type='checkbox' className='checkbox' />
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
                      <div className='font-bold'>{item.filename}</div>
                      <div className='text-sm opacity-50'>
                        {item.width}x{item.height}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <a href={item.url} target='_blank' rel='noreferrer'>
                    <button className='btn btn-ghost btn-xs'>open</button>
                  </a>
                </td>
                <td>{item.folder}</td>
                <th>
                  <button className='btn btn-ghost btn-xs'>delete</button>
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
            <th>URL</th>
            <th>folder</th>
            <th></th>
          </tr>
        </tfoot>
      </table>
    </div>
  );
});
export default Table;
