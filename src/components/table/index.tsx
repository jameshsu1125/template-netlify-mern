import useSelect from '@/hooks/useSelect';
import { forwardRef, useEffect, useImperativeHandle } from 'react';
import { SETTING } from '../../../setting';
import Delete from './delete';
import Edit from './edit';
import { RiDeleteBin5Line } from 'react-icons/ri';
import { TbEdit } from 'react-icons/tb';

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
      <div className='my-5 w-full'>
        <div className='overflow-x-auto'>
          <table className='table-zebra table-pin-rows table-pin-cols table-xs w-full text-center'>
            <thead className='bg-base-300 uppercase'>
              <tr>
                <th className='w-20'>index</th>
                {Object.keys(type)
                  .filter((key) => key !== 'timestamp')
                  .map((key) => {
                    return <th key={key}>{key}</th>;
                  })}
                <th className='w-32'>del</th>
                <th className='w-32'>edit</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, index) => {
                return (
                  <tr key={JSON.stringify(item)}>
                    <th>{index + 1}</th>
                    {Object.entries(item)
                      .filter(([key]) => key !== '_id' && key !== 'timestamp')
                      .map(([, value], sn) => {
                        return (
                          <td key={`${JSON.stringify(value)}${sn}`}>
                            <p className='py-2'>{String(value)}</p>
                          </td>
                        );
                      })}
                    <td>
                      <Delete update={update} collection={collection} data={item}>
                        <RiDeleteBin5Line />
                        Delete
                      </Delete>
                    </td>
                    <td>
                      <Edit type={type} update={update} collection={collection} data={item}>
                        <TbEdit />
                        Edit
                      </Edit>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className='bg-base-300 uppercase'>
              <tr>
                <th>index</th>
                {Object.keys(type)
                  .filter((key) => key !== 'timestamp')
                  .map((key) => {
                    return <th key={key}>{key}</th>;
                  })}
                <th>del</th>
                <th>edit</th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    )
  );
});

export default Table;
