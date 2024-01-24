import Button from '@/components/button';
import RichEditor, { RefObject } from '@/components/richEditor/draft';
import { memo, useEffect, useRef, useState } from 'react';
import Album from './album';
import './index.less';
import { useDebounce } from 'usehooks-ts';

type T = {
  onSubmit: (html: string) => void;
  defaultHTML?: string;
};

const Editor = memo(({ onSubmit, defaultHTML }: T) => {
  const ref = useRef<RefObject>(null);
  const [html, setHTML] = useState(defaultHTML || '');
  const debouncedValue = useDebounce(html, 2000);

  useEffect(() => {
    ref.current?.setHTML(html);
  }, [debouncedValue]);

  return (
    <div className='Editor prose flex max-w-full flex-row p-5'>
      <div className='flex-1'>
        <div role='tablist' className='tabs tabs-lifted'>
          <input
            id='Manage'
            type='radio'
            name='tab'
            role='tab'
            className='tab'
            aria-label='Rich'
            defaultChecked
          />
          <div role='tabpanel' className='tab-content rounded-box border-base-300 bg-base-100 p-6'>
            <div className='bg-white text-black'>
              <div className='w-full bg-base-300 py-2 text-center text-primary'>Rich Editor</div>
              <RichEditor
                defaultHTML={defaultHTML}
                onChange={(h) => {
                  setHTML(h);
                }}
                ref={ref}
              />
            </div>
          </div>
          <input type='radio' name='tab' role='tab' className='tab' aria-label='HTML' />
          <div role='tabpanel' className='tab-content rounded-box border-base-300 bg-base-100 p-6'>
            <div className='w-full bg-base-300 py-2 text-center text-primary'>HTML Editor</div>
            <textarea
              className='h-52 w-full'
              value={html}
              onChange={(e) => {
                setHTML(e.target.value);
              }}
            />
          </div>
        </div>
        <div className='flex w-full justify-center pt-5'>
          <Button
            className='btn-secondary btn-lg btn-wide'
            onClick={() => {
              onSubmit(ref.current?.getHTML() || '');
            }}
          >
            save
          </Button>
        </div>
      </div>

      <div className='w-44'>
        <Album />
      </div>
    </div>
  );
});
export default Editor;
