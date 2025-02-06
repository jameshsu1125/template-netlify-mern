import useSelect from '@/hooks/useSelect';
import { Context } from '@/settings/constant';
import { UserType } from '@/settings/type';
import { memo, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SETTING, TType } from '../../../setting';
import Add from './add';
import './index.less';
import Delete from './delete';

const User = memo(() => {
  const [context] = useContext(Context);
  const { user } = context;

  const navigate = useNavigate();
  const [users, getUsers] = useSelect();
  const [forceUpdate, update] = useState(0);

  const currentUsers = users?.data as Extract<TType, { type: string }>[];

  useEffect(() => {
    if (user.type !== UserType.Admin) navigate('/home');
    else getUsers({ collection: SETTING.mongodb[0].collection });
  }, [user.type, forceUpdate]);

  return (
    <div className='User'>
      <div className='overflow-x-auto overflow-y-scroll'>
        <table className='table'>
          <thead>
            <tr>
              <th>User</th>
              <th>Type</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {currentUsers
              ?.filter((_, i) => i !== 0)
              .map((data, i) => (
                <tr key={i}>
                  <td>
                    <div className='flex items-center gap-3'>
                      <div>
                        <div className='font-bold'>{data.userName}</div>
                        <div className='text-sm opacity-50'>{data.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{data.type}</td>
                  <th>
                    <Delete
                      data={data as Extract<TType, { type: string }> & { _id: string }}
                      update={update}
                    />
                  </th>
                </tr>
              ))}
          </tbody>
          <tfoot>
            <tr>
              <th>User</th>
              <th>Type</th>
              <th></th>
            </tr>
          </tfoot>
        </table>
      </div>
      <Add update={update} />
    </div>
  );
});
export default User;
