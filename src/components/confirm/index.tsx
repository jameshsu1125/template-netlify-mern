import { memo, useEffect } from 'react';

type T = {
  body: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const Confirm = memo(({ body, onConfirm, onCancel }: T) => {
  useEffect(() => {}, []);
  return (
    <div role='alert' className='alert rounded-none'>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        fill='none'
        viewBox='0 0 24 24'
        className='h-6 w-6 shrink-0 stroke-info'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2'
          d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
        ></path>
      </svg>
      <span>{body}</span>
      <div>
        <button onClick={() => onCancel()} className='btn btn-sm'>
          Deny
        </button>
        <button onClick={() => onConfirm()} className='btn btn-primary btn-sm'>
          Accept
        </button>
      </div>
    </div>
  );
});
export default Confirm;
