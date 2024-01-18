import Button from '@/components/button';
import RichEditor, { RefObject } from '@/components/richEditor';
import { memo, useRef } from 'react';
import './index.less';

const Editor = memo(() => {
  const ref = useRef<RefObject>(null);

  return (
    <div className='Editor prose max-w-full'>
      <div className='min-h-96 bg-white text-black'>
        <RichEditor ref={ref} />
      </div>
      <Button
        className='btn-secondary btn-lg'
        onClick={() => {
          console.log(ref.current?.getHTML());
        }}
      >
        save
      </Button>
    </div>
  );
});
export default Editor;
