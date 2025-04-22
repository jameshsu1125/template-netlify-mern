import useInsert from '@/hooks/useInsert';
import useSelect from '@/hooks/useSelect';
import { memo, useContext, useEffect, useRef } from 'react';
import { SETTING, TType } from '../../../setting';
import { Context } from '@/settings/constant';
import { ActionType, AlertType } from '@/settings/type';

const Add = memo(({ update }: { update: React.Dispatch<React.SetStateAction<number>> }) => {
  const [, setContext] = useContext(Context);
  const [respond, addUser] = useInsert();
  const [users, getUsers] = useSelect();
  const dataRef = useRef<Extract<TType, { type: string }> | null>(null);

  const onSubmit = (event: any) => {
    event.preventDefault();
    const formData = [...new FormData(event.target)];

    const data = Object.fromEntries(formData) as Extract<TType, { type: string }>;
    if (formData.length < 3) return;
    dataRef.current = data;
    getUsers({ collection: SETTING.mongodb[0].collection });
  };

  useEffect(() => {
    if (users) {
      if (dataRef.current) {
        const currentUser = users.data as Extract<TType, { email: string }>[];
        const hasDataAlready =
          currentUser.filter((user) => user.email === dataRef.current?.email).length !== 0;
        if (hasDataAlready) {
          setContext({
            type: ActionType.Alert,
            state: { enabled: true, body: 'email already exist', type: AlertType.Error },
          });
        } else {
          addUser({ collection: SETTING.mongodb[0].collection, data: dataRef.current });
          dataRef.current = null;
        }
      }
    }
  }, [respond, users]);

  useEffect(() => {
    if (respond?.res) {
      update((S) => S + 1);
    }
  }, [respond]);

  return (
    <form
      className='join join-vertical md:join-horizontal h-auto w-full md:w-auto'
      onSubmit={onSubmit}
    >
      <div>
        <div>
          <input
            name='userName'
            className='input join-item input-bordered w-full md:w-auto'
            placeholder='使用者姓名'
          />
        </div>
      </div>
      <div>
        <div>
          <input
            name='email'
            className='input join-item input-bordered w-full md:w-auto'
            placeholder='email'
          />
        </div>
      </div>
      <select name='type' className='join-item select select-bordered' defaultValue={'type'}>
        <option disabled>權限</option>
        <option value='admin'>管理員</option>
        <option value='inHouse'>內部使用者</option>
        <option value='user'>一般使用者</option>
      </select>
      <div className='indicator w-full md:w-auto'>
        <button type='submit' className='btn join-item w-full md:w-auto'>
          add user
        </button>
      </div>
    </form>
  );
});
export default Add;
