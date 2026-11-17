import { Context } from '@/settings/constant';
import { ActionType } from '@/settings/type';
import { memo, useContext } from 'react';
import { FaFolder } from 'react-icons/fa6';

const Breadcrumb = memo(() => {
  const [context, setContext] = useContext(Context);
  const folder = context[ActionType.Album].folder;
  const parts = folder === '*' || folder === '' ? [] : folder.split('/');
  const go = (target: string) => setContext({ type: ActionType.Album, state: { folder: target } });

  return (
    <div className='breadcrumbs min-w-0 flex-1 text-sm'>
      <ul>
        <li>
          <a onClick={() => go('*')}>
            <FaFolder />
            相簿
          </a>
        </li>
        {parts.map((name, index) => {
          const path = parts.slice(0, index + 1).join('/');
          return (
            <li key={path}>
              {index === parts.length - 1 ? (
                <span className='font-bold'>{name}</span>
              ) : (
                <a onClick={() => go(path)}>{name}</a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
});
export default Breadcrumb;
