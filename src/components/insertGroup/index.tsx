import { FormEvent, memo, useCallback, useEffect } from 'react';
import { SETTING, TYPE } from '../../../setting';
import useInsert from '@/hooks/useInsert';

const { type } = SETTING.mongodb[0];
type TParm = { type: typeof type; table: string; onSubmit: () => void };

const InsertGroup = memo(({ type, table, onSubmit }: TParm) => {
  const [respond, getInsert] = useInsert();

  const submit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries([...new FormData(e.currentTarget)]) as TYPE;
    getInsert({ table, data });
  }, []);

  useEffect(() => {
    if (respond) {
      if (respond.res) {
        onSubmit();
      }
    }
  }, [respond, onSubmit]);

  return (
    <div className='w-full flex justify-center'>
      <form onSubmit={submit}>
        <div className='join'>
          {Object.entries(type).map((item) => {
            const [key, value] = item;
            const type = String(value?.type).toLowerCase() === 'string' ? 'text' : 'number';
            return (
              <div key={key}>
                <div>
                  <input
                    className='input input-bordered join-item'
                    placeholder={key}
                    name={key}
                    type={type}
                  />
                </div>
              </div>
            );
          })}
          <div className='indicator'>
            <button type='submit' className='btn join-item'>
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  );
});
export default InsertGroup;
