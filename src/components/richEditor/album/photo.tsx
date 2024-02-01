import { Context } from '@/settings/constant';
import { ActionType, AlertType } from '@/settings/type';
import { memo, useCallback, useContext, useEffect } from 'react';
import { TUploadRespond } from '../../../../setting/type';
import { useCopyToClipboard } from '@uidotdev/usehooks';

type T = {
  data: TUploadRespond[];
};

const Photos = memo(({ data }: T) => {
  const [, setContext] = useContext(Context);
  const [copiedText, copy] = useCopyToClipboard();
  const height = window.innerHeight - 210 + 'px';

  const alertMessage = useCallback((status: boolean) => {
    if (status) {
      setContext({
        type: ActionType.Alert,
        state: { enabled: true, body: '網址已經複製到剪貼簿', type: AlertType.Success },
      });
    } else {
      setContext({
        type: ActionType.Alert,
        state: { enabled: true, body: '剪貼簿功能不支援', type: AlertType.Error },
      });
    }
  }, []);

  useEffect(() => {
    if (copiedText) alertMessage(true);
  }, [copiedText]);

  return (
    <div className='w-full space-y-1 overflow-y-scroll' style={{ height }}>
      {data.map((data) => {
        return (
          <div key={JSON.stringify(data)} className='relative w-full pb-[100%]'>
            <div className='absolute bottom-0 left-0 right-0 top-0'>
              <a
                className='prose'
                onClick={() => {
                  copy(data.secure_url);
                }}
              >
                <img className='h-full w-full object-cover' src={data.secure_url} alt='' />
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
});
export default Photos;
