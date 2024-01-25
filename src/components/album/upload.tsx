import Button from '@/components/button';
import useUpload from '@/hooks/useUpload';
import { CAPTURE_PROPERTY } from '@/settings/config';
import { Context } from '@/settings/constant';
import { ActionType } from '@/settings/type';
import CaptureProvider from 'lesca-react-capture-button';
import { TResult } from 'lesca-react-capture-button/lib/type';
import { Dispatch, SetStateAction, memo, useContext, useEffect, useRef, useState } from 'react';
import { FaImage } from 'react-icons/fa6';

const Information = memo(({ data, onComplete }: { data: TResult; onComplete?: () => void }) => {
  const [, setContext] = useContext(Context);
  const [respond, upload] = useUpload();
  const folderRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (respond) {
      if (respond.res) {
        setContext({ type: ActionType.Alert, state: { enabled: true, body: respond.msg } });
        onComplete?.();
      }
    }
  }, [respond]);

  return (
    <>
      <img src={data.image} alt='' className='max-w-full' />
      <div className='my-5 text-base'>
        size:
        <span className='px-2'>
          {data.width} x {data.height}
        </span>
      </div>
      <div className='join'>
        <input ref={folderRef} className='input join-item input-bordered' placeholder='folder' />
        <Button
          className='join-item'
          onClick={() => {
            const folder = folderRef.current?.value || '';
            upload({ image: data.image, folder });
          }}
        >
          upload now
        </Button>
      </div>
    </>
  );
});

const Upload = memo(({ reload }: { reload: Dispatch<SetStateAction<number>> }) => {
  const [result, setResult] = useState<TResult>({ image: '', width: 0, height: 0 });
  return (
    <div className='w-full'>
      {result.image && (
        <Information
          data={result}
          onComplete={() => {
            setResult({ image: '', width: 0, height: 0 });
            setTimeout(() => {
              document.querySelector<HTMLInputElement>('#Manage')?.click();
              reload((prev) => prev + 1);
            }, 500);
          }}
        />
      )}
      {!result.image && (
        <CaptureProvider
          maxWidth={CAPTURE_PROPERTY.maxWidth}
          compress={CAPTURE_PROPERTY.compress}
          onCapture={(e) => {
            setResult(e);
          }}
        >
          <Button className='btn-block'>
            <FaImage />
            Capture
          </Button>
        </CaptureProvider>
      )}
    </div>
  );
});
export default Upload;
