import { Prettify } from '@/settings/type';
import { memo, useMemo } from 'react';
import { SETTING } from '../../../setting';
import './index.less';

type T = typeof SETTING.mongodb;

const Table = memo(({ data }: Prettify<{ data: T }>) => {
  const [currentData] = data;
  const keys = Object.keys(currentData);
  const { collection } = currentData;

  const { schema } = currentData;
  const table = useMemo(() => {
    return Object.entries(schema).map((each) => {
      const [tableName, tableValue] = each;
      const { type, required, default: def } = tableValue;
      let requiredDefault = '';

      if (required !== undefined) {
        requiredDefault = 'required : ' + JSON.stringify(required).split('"').join('');
      }

      if (def !== undefined) {
        requiredDefault = 'default : ' + JSON.stringify(def).split('"').join('');
      }
      return [tableName, type, requiredDefault];
    });
  }, [schema]);

  return (
    <div className='mockup-browser border border-base-300'>
      <div className='mockup-browser-toolbar'>
        <div className='input border border-base-300'>{`/ ${collection}`}</div>
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
                <td>{currentData.collection}</td>
                <td>{currentData.description}</td>
                <td>
                  <div className='overflow-x-auto'>
                    <table className='table table-xs'>
                      <thead>
                        <tr>
                          <th>table name</th>
                          <th>type</th>
                          <th>setting</th>
                        </tr>
                      </thead>
                      <tbody>
                        {table.map((each) => (
                          <tr key={JSON.stringify(each)}>
                            {each.map((v, index) => (
                              <td key={`${v}${index}`}>{v}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <th>table name</th>
                          <th>type</th>
                          <th>setting</th>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});
export default Table;
