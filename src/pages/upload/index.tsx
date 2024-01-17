import Button from '@/components/button';
import CaptureProvider from 'lesca-react-capture-button';
import { memo, useEffect } from 'react';
import './index.less';
import useUpload from '@/hooks/useUpload';
import List from './list';

const Upload = memo(() => {
  const [respond, upload] = useUpload();
  useEffect(() => {
    if (respond) console.log(respond);
  }, [respond]);
  return (
    <div className='Upload'>
      <CaptureProvider
        size={200}
        onCapture={(e) => {
          upload(e);
          console.log(e);
        }}
      >
        <Button>Upload</Button>
      </CaptureProvider>
      <List />
    </div>
  );
});
export default Upload;
