import useSelect from '@/hooks/useSelect';
import { Context } from '@/settings/constant';
import { ActionType, AlertType } from '@/settings/type';
import { forwardRef, useContext, useEffect, useImperativeHandle } from 'react';
import { SETTING } from '../../../setting';
import Delete from './delete';
import Edit from './edit';

const { type } = SETTING.mongodb[0];
type TParm = { type: typeof type; table: string };

const Table = forwardRef(({ type, table }: TParm, ref) => {
  const [, setContext] = useContext(Context);
  const [data, getUsers] = useSelect();
  const currentData = data?.data ? data.data : [];

  useEffect(() => {
    getUsers({ table });
  }, [table]);

  useEffect(() => {
    if (data) {
      setContext({
        type: ActionType.Alert,
        state: { enabled: true, body: data.msg, type: AlertType.Info },
      });
    }
  }, [data]);

  const update = () => getUsers({ table });

  useImperativeHandle(ref, () => ({
    update,
  }));

  return (
    data && (
      <div className='w-full my-5'>
        <div className='overflow-x-auto'>
          <table className='table table-xs text-center'>
            <thead>
              <tr>
                <th>index</th>
                <th>_id</th>
                {Object.keys(type).map((key) => {
                  return <th key={key}>{key}</th>;
                })}
                <th>__v</th>
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
                      return <td key={`${JSON.stringify(v)}${sn}`}>{String(v)}</td>;
                    })}
                    <td>
                      <Delete update={update} table={table} data={item}>
                        Delete
                      </Delete>
                    </td>
                    <td>
                      <Edit update={update} table={table} data={item}>
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
                <th>__v</th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    )
  );
});

export default Table;
