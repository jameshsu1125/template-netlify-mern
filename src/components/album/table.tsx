import { Context } from '@/settings/constant';
import { ActionType, AlertType } from '@/settings/type';
import { useCopyToClipboard } from '@uidotdev/usehooks';
import { memo, useCallback, useContext, useEffect } from 'react';
import { TUploadRespond } from '../../../setting/type';
import TR from './tr';

type T = {
  data: TUploadRespond[];
  reload: React.Dispatch<React.SetStateAction<number>>;
  check: (check: boolean, public_id: string) => void;
};

const Table = memo(({ data, check, reload }: T) => {
  const [context, setContext] = useContext(Context);
  const folder = context[ActionType.Album].folder;

  const [copiedText] = useCopyToClipboard();

  const alertMessage = useCallback(
    (status: boolean) => {
      if (status) {
        setContext({
          type: ActionType.Alert,
          state: { enabled: true, body: '網址已經複製到剪貼簿', type: AlertType.Success },
        });
      } else {
        setContext({
          type: ActionType.Alert,
          state: { enabled: true, body: '剪貼簿功能不支援', type: AlertType.Error },
        });
      }
    },
    [setContext],
  );

  useEffect(() => {
    if (copiedText) alertMessage(true);
  }, [copiedText]);

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
            return <TR key={JSON.stringify(item)} item={item} check={check} reload={reload} />;
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
