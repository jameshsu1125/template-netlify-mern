import Tiptap from '@/components/tiptab';
import useInsert from '@/hooks/useInsert';
import useSelect from '@/hooks/useSelect';
import { Context } from '@/settings/constant';
import { ActionType, AlertType } from '@/settings/type';
import { memo, useCallback, useContext, useEffect } from 'react';
import { TType } from '../../../setting';
import useUpdate from '@/hooks/useUpdate';

const EditorPage = memo(() => {
  const [, setContext] = useContext(Context);
  const [response, insert] = useInsert();
  const [responseUpdate, update] = useUpdate();
  const [data, setData] = useSelect();

  const currentData = data?.data as Extract<TType, { html: string }>[];

  useEffect(() => {
    if (response) {
      if (response.res) {
        setContext({
          type: ActionType.Alert,
          state: { enabled: true, type: AlertType.Success, body: response.msg },
        });
      }
    }
    if (responseUpdate) {
      if (responseUpdate.res) {
        setContext({
          type: ActionType.Alert,
          state: { enabled: true, type: AlertType.Success, body: responseUpdate.msg },
        });
      }
    }
  }, [response, responseUpdate, setContext]);

  useEffect(() => {
    setData({ collection: 'editor' });
  }, []);

  const onSave = useCallback(
    (html: string) => {
      if (currentData && currentData.length > 0) {
        update({
          collection: 'editor',
          data: { _id: (currentData[0] as any)._id, data: { html } },
        });
      } else {
        insert({ collection: 'editor', data: { html } });
      }
    },
    [currentData, insert, update],
  );

  return <Tiptap html={currentData?.[0]?.html || ''} onSave={onSave} />;
});
export default EditorPage;
