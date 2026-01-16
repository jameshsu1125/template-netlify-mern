import Tiptap from '@/components/tiptab';
import useInsert from '@/hooks/useInsert';
import { Context } from '@/settings/constant';
import { ActionType, AlertType } from '@/settings/type';
import { memo, useContext, useEffect } from 'react';

const EditorPage = memo(() => {
  const [, setContext] = useContext(Context);
  const [response, insert] = useInsert();
  useEffect(() => {
    if (response) {
      if (response.res) {
        setContext({
          type: ActionType.Alert,
          state: { enabled: true, type: AlertType.Success, body: response.msg },
        });
      }
    }
  }, [response]);
  return (
    <div className='w-full'>
      <Tiptap
        onSave={(html) => {
          insert({ collection: 'editor', data: { html } });
        }}
      />
    </div>
  );
});
export default EditorPage;
