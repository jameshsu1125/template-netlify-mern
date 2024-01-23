import Button from '@/components/button';
import RichEditor, { RefObject } from '@/components/richEditor/draft';
import { memo, useEffect, useRef, useState } from 'react';
import Album from './album';
import './index.less';
import { useDebounce } from 'usehooks-ts';

type T = {
  getHTML: (html: string) => void;
  defaultHTML?: string;
};

const Editor = memo(({ getHTML, defaultHTML }: T) => {
  const ref = useRef<RefObject>(null);
  const [html, setHTML] = useState(defaultHTML || '');
  const debouncedValue = useDebounce(html, 2000);

  useEffect(() => {
    ref.current?.setHTML(html);
  }, [debouncedValue]);

  return (
    <div className='Editor prose flex max-w-full flex-row'>
      <div className='flex-1'>
        <div className='bg-white p-3 text-black'>
          <RichEditor
            defaultHTML={defaultHTML}
            onChange={(h) => {
              setHTML(h);
            }}
            ref={ref}
          />
        </div>
        <div className='w-full bg-base-300 py-2 text-center text-primary'>
          ⇡⇡⇡⇡ HTML Editor ⇣⇣⇣⇣⇣
        </div>
        <textarea
          className='h-52 w-full'
          value={html}
          onChange={(e) => {
            setHTML(e.target.value);
          }}
        />
        <Button
          className='btn-secondary btn-lg btn-wide'
          onClick={() => {
            getHTML(ref.current?.getHTML() || '');
          }}
        >
          save
        </Button>
      </div>
      <div className='w-44'>
        <Album />
      </div>
    </div>
  );
});
export default Editor;
