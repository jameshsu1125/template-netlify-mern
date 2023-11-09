import { Prettify } from '@/settings/type';
import { memo } from 'react';
import { SETTING } from '../../../setting';
import './index.less';

type T = typeof SETTING.mongodb;

const Table = memo(({ data }: Prettify<{ data: T }>) => {
  const [currentData] = data;
  const keys = Object.keys(currentData);
  const { table } = currentData;

  return (
    <div className='mockup-browser border border-base-300'>
      <div className='mockup-browser-toolbar'>
        <div className='input border border-base-300'>{`/ ${table}`}</div>
      </div>
      <div className='flex justify-center px-4 py-16 border-t bg-base-300 border-base-300'>
        <div className='overflow-x-auto w-full'>
          <table className='table'>
            <thead>
              <tr>
                {keys
                  .filter((key) => key !== 'type')
                  .map((key) => (
                    <th key={key}>{key}</th>
                  ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{currentData.table}</td>
                <td>{currentData.description}</td>
                <td>{JSON.stringify(currentData.type)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});
export default Table;
