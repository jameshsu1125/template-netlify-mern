import useDelete from '@/hooks/useDelete';
import { Context } from '@/settings/constant';
import { ActionType, AlertType, IReactProps } from '@/settings/type';
import { memo, useContext, useEffect } from 'react';

type TParm = {
  collection: string;
  data: any;
  update: () => void;
};

const Delete = memo(({ children, collection, data, update }: IReactProps & TParm) => {
  const [, setContext] = useContext(Context);
  const [respond, getDelete] = useDelete();

  useEffect(() => {
    if (respond) {
      let type = AlertType.Error;
      if (respond.res) {
        type = AlertType.Success;
        update();
      }
      setContext({ type: ActionType.Alert, state: { enabled: true, body: respond.msg, type } });
    }
  }, [respond]);

  return (
    <button
      onClick={() => {
        const { _id } = data;
        if (_id) {
          const currentData = { _id };
          getDelete({ collection, data: currentData });
        }
      }}
      className='btn btn-warning btn-xs'
    >
      {children}
    </button>
  );
});
export default Delete;
