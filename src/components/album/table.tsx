import { Context } from '@/settings/constant';
import { ActionType } from '@/settings/type';
import { memo, useContext } from 'react';
import { TUploadRespond } from '../../../setting/type';
import TR from './tr';

type T = {
  data: TUploadRespond[];
  check: (check: boolean, public_id: string) => void;
};

const Table = memo(({ data, check }: T) => {
  const [context] = useContext(Context);
  const folder = context[ActionType.Album].folder;

  return (
    <div className='overflow-x-auto'>
      <table className='table'>
        <thead>
          <tr>
            <th></th>
            <th>image information</th>
            <th>action</th>
          </tr>
        </thead>
        <tbody>
          {folder !== '*' && <TR check={check} />}
          {data.map((item) => {
            return <TR key={JSON.stringify(item)} item={item} check={check} />;
          })}
        </tbody>
        <tfoot>
          <tr>
            <th></th>
            <th>image information</th>
            <th>action</th>
          </tr>
        </tfoot>
      </table>
    </div>
  );
});
export default Table;
