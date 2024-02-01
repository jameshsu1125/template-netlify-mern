import Button from '@/components/button';
import RichEditor, { RefObject } from '@/components/richEditor/draft';
import { memo, useEffect, useRef, useState } from 'react';
import { IoIosSave } from 'react-icons/io';
import Tab from '../tab';
import Album from './album';
import './index.less';
import { useDebounce } from '@uidotdev/usehooks';

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
        <Tab>
          <Tab.Panel label='Rich Editor'>
            <div className='w-full bg-base-300 py-2 text-center text-primary'>Rich Editor</div>
            <div className='bg-white text-black'>
              <RichEditor
                defaultHTML={defaultHTML}
                onChange={(h) => {
                  setHTML(h);
                }}
                ref={ref}
              />
            </div>
          </Tab.Panel>
          <Tab.Panel label='HTML Editor'>
            <div className='w-full bg-base-300 py-2 text-center text-primary'>HTML Editor</div>
            <textarea
              className='h-52 w-full'
              value={html}
              onChange={(e) => {
                setHTML(e.target.value);
              }}
            />
          </Tab.Panel>
        </Tab>
        <div className='flex w-full justify-center px-5 pt-10'>
          <Button
            className='btn-lg btn-block uppercase'
            onClick={() => {
              onSubmit(ref.current?.getHTML() || '');
            }}
          >
            <IoIosSave />
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
