import useInsert from '@/hooks/useInsert';
import { Context } from '@/settings/constant';
import { ActionType, AlertType } from '@/settings/type';
import { FormEvent, memo, useCallback, useContext, useEffect } from 'react';
import { SETTING, TYPE } from '../../../setting';
import { IType } from '../../../setting/type';

const { schema } = SETTING.mongodb[0];
type TProps = { type: typeof schema; collection: string; onSubmit: () => void };
type TData = { [k: string]: any };

const InsertGroup = memo(({ type, collection, onSubmit }: TProps) => {
  const [, setContext] = useContext(Context);
  const [respond, getInsert] = useInsert();

  const submit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const data: TData = Object.fromEntries([...formData]);
      const checkbox = Object.entries(type).filter((item) => item[1].type === IType.Boolean);

      checkbox.forEach((item) => {
        const [key] = item;
        const [value] = Object.entries(data)
          .filter((item) => item[0] === key)
          .map((e) => e[1]);
        if (value) data[key] = true;
        else data[key] = false;
      });

      const currentData = data as TYPE;
      getInsert({ collection, data: currentData });
    },
    [type, collection],
  );

  useEffect(() => {
    if (respond) {
      let type = AlertType.Error;
      if (respond.res) {
        type = AlertType.Success;
        onSubmit();
      }
      setContext({ type: ActionType.Alert, state: { enabled: true, type, body: respond.msg } });
    }
  }, [respond, onSubmit]);

  const Element = ({ key, type }: { key: string; type: IType }) => {
    switch (type) {
      case IType.String:
        return (
          <input
            className='input input-sm input-bordered join-item'
            placeholder={key}
            name={key}
            type='text'
          />
        );
      case IType.Number:
        return (
          <input
            className='input input-sm input-bordered join-item'
            placeholder={key}
            name={key}
            type='number'
          />
        );
      case IType.Boolean:
        return (
          <div className='form-control mx-2'>
            <label className='label cursor-pointer space-x-2 pt-1'>
              <span className='label-text'>{key}</span>
              <input type='checkbox' name={key} className='checkbox' />
            </label>
          </div>
        );
    }
  };

  return (
    <div className='w-full flex justify-center'>
      <form onSubmit={submit}>
        <div className='join join-vertical md:join-horizontal'>
          {Object.entries(type).map((item) => {
            const [key, value] = item;
            const t = String(value?.type) as IType;
            return (
              <div key={key}>
                <div>{Element({ key, type: t })}</div>
              </div>
            );
          })}
          <div className='indicator'>
            <button type='submit' className='btn btn-sm join-item'>
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  );
});
export default InsertGroup;
