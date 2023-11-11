import useSelect from '@/hooks/useSelect';
import { forwardRef, useEffect, useImperativeHandle } from 'react';
import { SETTING } from '../../../setting';
import Delete from './delete';
import Edit from './edit';

const { schema } = SETTING.mongodb[0];
type TProps = { type: typeof schema; collection: string };

const Table = forwardRef(({ type, collection }: TProps, ref) => {
  const [data, getUsers] = useSelect();
  const currentData = data?.data ? data.data : [];

  useEffect(() => {
    getUsers({ collection });
  }, [collection]);

  const update = () => getUsers({ collection });
  useImperativeHandle(ref, () => ({ update }));

  return (
    data && (
      <div className='w-full my-5'>
        <div className='overflow-x-auto'>
          <table className='table table-xs text-center table-pin-rows table-pin-cols'>
            <thead>
              <tr>
                <th>index</th>
                <th>_id</th>
                {Object.keys(type).map((key) => {
                  return <th key={key}>{key}</th>;
                })}
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, index) => {
                return (
                  <tr key={JSON.stringify(item)}>
                    <th>{index}</th>
                    {Object.values(item).map((v, sn) => {
                      return (
                        <td key={`${JSON.stringify(v)}${sn}`}>
                          <p>{String(v)}</p>
                        </td>
                      );
                    })}
                    <td>
                      <Delete update={update} collection={collection} data={item}>
                        Delete
                      </Delete>
                    </td>
                    <td>
                      <Edit type={type} update={update} collection={collection} data={item}>
                        Edit
                      </Edit>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <th></th>
                <th>_id</th>
                {Object.keys(type).map((key) => {
                  return <th key={key}>{key}</th>;
                })}
                <th></th>
                <th></th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    )
  );
});

export default Table;
