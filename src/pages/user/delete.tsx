import useDelete from '@/hooks/useDelete';
import { memo, useEffect } from 'react';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { SETTING, TType } from '../../../setting';

type TProps = {
  data: Extract<TType, { type: string }> & { _id: string };
  update: React.Dispatch<React.SetStateAction<number>>;
};

const Delete = memo(({ data, update }: TProps) => {
  const [respond, deleteUser] = useDelete();
  useEffect(() => {
    if (respond?.res) update((S) => S + 1);
  }, [respond]);
  return (
    <button
      className='btn btn-ghost btn-sm'
      onClick={() => {
        deleteUser({ collection: SETTING.mongodb[0].collection, data: { _id: data._id } });
      }}
    >
      <RiDeleteBin6Line />
      delete
    </button>
  );
});
export default Delete;
