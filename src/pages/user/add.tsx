import { memo, useEffect } from 'react';
import useInsert from '@/hooks/useInsert';
import { SETTING, TType } from '../../../setting';

const Add = memo(({ update }: { update: React.Dispatch<React.SetStateAction<number>> }) => {
  const [respond, addUser] = useInsert();

  const onSubmit = (event: any) => {
    event.preventDefault();
    const formData = [...new FormData(event.target)];

    const data = Object.fromEntries(formData) as TType;
    if (formData.length < 3) return;
    addUser({ collection: SETTING.mongodb[0].collection, data });
  };

  useEffect(() => {
    if (respond?.res) {
      update((S) => S + 1);
    }
  }, [respond]);

  return (
    <form
      className='join join-vertical h-auto w-full md:join-horizontal md:w-auto'
      onSubmit={onSubmit}
    >
      <div>
        <div>
          <input
            name='userName'
            className='input join-item input-bordered w-full md:w-auto'
            placeholder='user name'
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
        <option disabled>type</option>
        <option>admin</option>
        <option>inHouse</option>
        <option>user</option>
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
