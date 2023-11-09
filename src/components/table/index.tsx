import useSelect from '@/hooks/useSelect';
import { Fragment, forwardRef, useContext, useEffect, useImperativeHandle } from 'react';
import { SETTING } from '../../../setting';
import { Context } from '@/settings/constant';
import { ActionType, AlertType } from '@/settings/type';

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

  useImperativeHandle(ref, () => ({
    update() {
      getUsers({ table });
    },
  }));

  return (
    data && (
      <div className='w-full my-5'>
        <div className='overflow-x-auto'>
          <table className='table table-xs text-center'>
            <thead>
              <tr>
                <th></th>
                <th>_id</th>
                {Object.keys(type).map((key) => {
                  return <th key={key}>{key}</th>;
                })}
                <th>__v</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item) => {
                return (
                  <tr key={JSON.stringify(item)}>
                    {Object.values(item).map((v, index) => {
                      if (index === 0) {
                        return (
                          <Fragment key={`${JSON.stringify(v)}${index}`}>
                            <th>{index + 1}</th>
                            <td>{String(v)}</td>
                          </Fragment>
                        );
                      }
                      return <td key={`${JSON.stringify(v)}${index}`}>{String(v)}</td>;
                    })}
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
