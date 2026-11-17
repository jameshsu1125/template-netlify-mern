import useRemove from '@/hooks/useRemove';
import useRemoveMany from '@/hooks/useRemoveMany';
import { Context } from '@/settings/constant';
import { ActionType, AlertType } from '@/settings/type';
import { memo, useContext, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { IRespond } from '../../../setting';
import { AlbumContext, dropTree, removeKey, TConfirm } from './config';

/** delete confirmation for one image, several images or a folder */
const AlbumConfirm = memo(() => {
  const [context, setContext] = useContext(Context);
  const [state, setState] = useContext(AlbumContext);
  const folder = context[ActionType.Album].folder;
  const [removeRespond, remove] = useRemove();
  const [manyRespond, removeMany] = useRemoveMany();
  const target = useRef<TConfirm>(null);

  const onDone = (respond?: IRespond) => {
    const done = target.current;
    if (!respond || !done) return;
    target.current = null;
    setContext({
      type: ActionType.Alert,
      state: {
        enabled: true,
        type: respond.res ? AlertType.Success : AlertType.Error,
        body: respond.msg,
      },
    });
    setState((S) => {
      // folders are only deleted from their parent, so refreshing the current level is enough
      const tree = dropTree(S.tree, folder);
      if (!respond.res) return { ...S, confirm: null, reload: S.reload + 1 };
      const detailGone = S.detail && done.public_id.includes(S.detail.public_id);
      const detailKeyGone = S.detail && done.public_id.includes(removeKey(S.detail));
      return {
        ...S,
        tree,
        confirm: null,
        selected: S.selected.filter((k) => !done.public_id.includes(k)),
        detail: detailGone || detailKeyGone ? null : S.detail,
        reload: S.reload + 1,
      };
    });
  };

  useEffect(() => onDone(removeRespond), [removeRespond]);
  useEffect(() => onDone(manyRespond), [manyRespond]);

  if (!state.confirm) return null;
  const { title, body, public_id } = state.confirm;
  const close = () => setState((S) => ({ ...S, confirm: null }));

  // portal: inside the editor modal a transformed modal-box would trap position: fixed
  return createPortal(
    <dialog className='modal modal-open z-50' open>
      <div className='modal-box'>
        <h3 className='text-lg font-bold'>{title}</h3>
        <p className='py-4'>{body}</p>
        <div className='modal-action'>
          <button type='button' className='btn btn-ghost' onClick={close}>
            取消
          </button>
          <button
            type='button'
            className='btn btn-error'
            onClick={() => {
              target.current = state.confirm;
              if (public_id.length === 1) remove({ public_id: public_id[0] });
              else removeMany({ public_ids: public_id });
            }}
          >
            刪除
          </button>
        </div>
      </div>
      <div className='modal-backdrop' onClick={close} />
    </dialog>,
    document.body,
  );
});
export default AlbumConfirm;
