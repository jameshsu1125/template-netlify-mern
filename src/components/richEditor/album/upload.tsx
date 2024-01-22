import useUpload from '@/hooks/useUpload';
import { CAPTURE_PROPERTY } from '@/settings/config';
import CaptureProvider from 'lesca-react-capture-button';
import { memo, useEffect } from 'react';

type T = {
  reload: () => void;
  folder: string;
};

const Uploader = memo(({ reload, folder }: T) => {
  const [respond, upload] = useUpload();
  useEffect(() => {
    if (respond && respond.res) reload();
  }, [respond]);

  return (
    <CaptureProvider
      maxWidth={CAPTURE_PROPERTY.maxWidth}
      compress={CAPTURE_PROPERTY.compress}
      onCapture={(e) => {
        const currentFolder = folder.slice(1);
        upload({ folder: currentFolder, image: e.image });
      }}
    >
      <button className='btn btn-primary btn-xs'>Upload here</button>
    </CaptureProvider>
  );
});
export default Uploader;
