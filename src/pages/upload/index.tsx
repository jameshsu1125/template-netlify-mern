import Button from '@/components/button';
import useUpload from '@/hooks/useUpload';
import CaptureProvider from 'lesca-react-capture-button';
import { memo, useEffect } from 'react';
import './index.less';
import List from './list';

const Upload = memo(() => {
  const [respond, upload] = useUpload();
  useEffect(() => {
    if (respond) console.log(respond);
  }, [respond]);
  return (
    <div className='flex w-full flex-col p-5'>
      <List />
      <CaptureProvider
        size={200}
        onCapture={(e) => {
          upload(e);
          console.log(e);
        }}
      >
        <Button>Upload</Button>
      </CaptureProvider>
    </div>
  );
});
export default Upload;
