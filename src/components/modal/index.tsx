import { Context } from '@/settings/constant';
import { ActionType } from '@/settings/type';
import { memo, useContext, useEffect } from 'react';

interface TModal extends HTMLElement {
  showModal: () => void;
}

const Modal = memo(() => {
  const [context, setContext] = useContext(Context);
  const { title, body, label, onClose } = context[ActionType.modal];

  useEffect(() => {
    const modal = document.getElementById('my_modal_4') as TModal;
    if (modal) modal.showModal();
  }, []);

  return (
    <dialog id='my_modal_4' className='modal'>
      <div className='modal-box w-11/12 max-w-5xl'>
        <h3 className='font-bold text-lg'>{title}</h3>
        <div className='py-4'>{body}</div>
        <div className='modal-action'>
          <form method='dialog'>
            <button
              onClick={() => {
                setTimeout(() => {
                  onClose();
                  setContext({ type: ActionType.modal, state: { enabled: false } });
                }, 500);
              }}
              className='btn'
            >
              {label}
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
});
export default Modal;
