import { Context } from '@/settings/constant';
import { ActionType, AlertType } from '@/settings/type';
import { memo, useContext, useEffect, useMemo, useRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { error, info, normal, success, warning } from './icon';

const Alert = memo(() => {
  const ref = useRef<any>();

  const [context, setContext] = useContext(Context);
  const alert = context[ActionType.Alert];
  const { type, body, time } = alert;

  const icon = useMemo(() => {
    switch (type) {
      case AlertType.Info:
        return info;
      case AlertType.Success:
        return success;
      case AlertType.Error:
        return error;
      case AlertType.Warning:
        return warning;
      default:
        return normal;
    }
  }, [type]);

  useEffect(() => {
    clearTimeout(ref.current);
    ref.current = setTimeout(() => {
      setContext({ type: ActionType.Alert, state: { enabled: false } });
    }, time);
  }, [body]);

  return (
    <div className='fixed bottom-1 right-1 z-50'>
      <div className={twMerge('alert', type)}>
        {icon}
        <span>{body}</span>
      </div>
    </div>
  );
});
export default Alert;
