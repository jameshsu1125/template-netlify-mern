import Button from '@/components/button';
import useRemove from '@/hooks/useRemove';
import useRemoveMany from '@/hooks/useRemoveMany';
import useSearch from '@/hooks/useSearch';
import { Context } from '@/settings/constant';
import { ActionType, AlertType } from '@/settings/type';
import { memo, useCallback, useContext, useEffect, useState } from 'react';
import { MdAutoDelete } from 'react-icons/md';
import { AlbumContext } from './config';
import Table from './table';

type T = {
  reload: React.Dispatch<React.SetStateAction<number>>;
};

const List = memo(({ reload }: T) => {
  const [, setContext] = useContext(Context);
  const [state, setState] = useContext(AlbumContext);
  const [respond] = useSearch();
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
    setState((S) => ({ ...S, submit: false, public_id: [] }));
  }, [removeRespond, checkRespond]);

  useEffect(() => {
    if (state.submit) {
      if (state.public_id.length === 1) removeResource({ public_id: state.public_id[0] });
      else checkResource({ public_ids: state.public_id });
    }
  }, [state]);

  const check = useCallback((check: boolean, public_id: string) => {
    if (check) setCheckList((S) => [...S, public_id]);
    else setCheckList((S) => S.filter((item) => item !== public_id));
  }, []);

  const removeSelect = useCallback(() => {
    setState((S) => ({
      ...S,
      enabled: true,
      body: 'Are you sure to remove selected?',
      public_id: checkList,
    }));
  }, [setState, checkList]);

  return (
    <div className='List'>
      {respond?.data && <Table data={respond.data} check={check} />}
      {checkList.length !== 0 && (
        <Button onClick={removeSelect} className='btn-block uppercase'>
          <MdAutoDelete />
          remove selected
        </Button>
      )}
    </div>
  );
});
export default List;
