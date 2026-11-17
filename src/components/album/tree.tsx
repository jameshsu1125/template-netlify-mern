import useSearch from '@/hooks/useSearch';
import { Context } from '@/settings/constant';
import { ActionType } from '@/settings/type';
import { memo, useContext } from 'react';
import { FaChevronDown, FaChevronRight, FaFolder, FaFolderOpen } from 'react-icons/fa6';
import { twMerge } from 'tailwind-merge';
import { AlbumContext, folderNames, joinPath } from './config';

const Node = memo(
  ({ path, name, onExpand }: { path: string; name: string; onExpand: (path: string) => void }) => {
    const [context, setContext] = useContext(Context);
    const [state, setState] = useContext(AlbumContext);
    const current = context[ActionType.Album].folder;
    const isOpen = state.expanded.includes(path);
    const children = state.tree[path];

    const toggle = () => {
      setState((S) => ({
        ...S,
        expanded: isOpen ? S.expanded.filter((p) => p !== path) : [...S.expanded, path],
      }));
      if (!isOpen && !children) onExpand(path);
    };

    return (
      <li>
        <div
          className={twMerge('flex gap-1.5 pl-1', current === path ? 'menu-active' : '')}
          onClick={() => setContext({ type: ActionType.Album, state: { folder: path } })}
        >
          <button
            type='button'
            className='btn btn-ghost btn-xs btn-square'
            aria-label={isOpen ? '收合' : '展開'}
            onClick={(e) => {
              e.stopPropagation();
              toggle();
            }}
          >
            {isOpen ? <FaChevronDown /> : <FaChevronRight />}
          </button>
          {current === path ? <FaFolderOpen /> : <FaFolder />}
          <span className='truncate'>{name}</span>
        </div>
        {isOpen && (
          <ul>
            {!children && (
              <li className='menu-disabled'>
                <span>
                  <span className='loading loading-dots loading-xs' />
                </span>
              </li>
            )}
            {children?.length === 0 && (
              <li className='menu-disabled'>
                <span className='text-xs'>沒有子資料夾</span>
              </li>
            )}
            {children?.map((child) => (
              <Node key={child} path={joinPath(path, child)} name={child} onExpand={onExpand} />
            ))}
          </ul>
        )}
      </li>
    );
  },
);

/** folder tree, each level is fetched the first time it is expanded */
const Tree = memo(() => {
  const [, setState] = useContext(AlbumContext);
  const [, fetch] = useSearch({ auto: false, silent: true });

  const onExpand = async (path: string) => {
    const respond = await fetch({ folder: path });
    const names = respond?.res ? folderNames(respond.data) : [];
    setState((S) => ({ ...S, tree: { ...S.tree, [path]: names } }));
  };

  return (
    <ul className='menu menu-sm w-full'>
      <li className='menu-title'>資料夾</li>
      <Node path='*' name='相簿' onExpand={onExpand} />
    </ul>
  );
});
export default Tree;
