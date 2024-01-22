import useSearch from '@/hooks/useSearch';
import { memo, useCallback, useContext, useEffect, useState } from 'react';
import Table from './table';
import { TUploadRespond } from '../../../setting/type';
import useRemove from '@/hooks/useRemove';
import { Context } from '@/settings/constant';
import { ActionType, AlertType } from '@/settings/type';
import useRemoveMany from '@/hooks/useRemoveMany';
import Button from '@/components/button';

const List = memo(({ reload }: { reload: React.Dispatch<React.SetStateAction<number>> }) => {
  const [, setContext] = useContext(Context);
  const [respond] = useSearch();
  const [list, setList] = useState<TUploadRespond[]>();
  const [removeRespond, removeResource] = useRemove();
  const [checkRespond, checkResource] = useRemoveMany();
  const [checkList, setCheckList] = useState<string[]>([]);

  useEffect(() => {
    if (removeRespond) {
      const currentType = removeRespond.res ? AlertType.Success : AlertType.Error;
      setContext({
        type: ActionType.Alert,
        state: { enabled: true, type: currentType, body: removeRespond.msg },
      });
      reload((prev) => prev + 1);
    }
    if (checkRespond) {
      const currentType = checkRespond.res ? AlertType.Success : AlertType.Error;
      setContext({
        type: ActionType.Alert,
        state: { enabled: true, type: currentType, body: checkRespond.msg },
      });
      reload((prev) => prev + 1);
    }
  }, [removeRespond, checkRespond]);

  const remove = useCallback((public_id: string) => {
    removeResource({ public_id });
  }, []);

  const check = useCallback((check: boolean, public_id: string) => {
    if (check) setCheckList((S) => [...S, public_id]);
    else setCheckList((S) => S.filter((item) => item !== public_id));
  }, []);

  const removeSelect = useCallback(() => {
    checkResource({ public_ids: checkList });
  }, [checkList]);

  useEffect(() => {
    if (respond) {
      const { data } = respond;
      setList(data);
    }
  }, [respond]);

  return (
    <div className='List'>
      {list && <Table data={list} remove={remove} check={check} />}
      {checkList.length !== 0 && <Button onClick={removeSelect}>remove selected</Button>}
    </div>
  );
});
export default List;
