import useSearch from '@/hooks/useSearch';
import { Context } from '@/settings/constant';
import { ActionType, AlertType } from '@/settings/type';
import copyTextToClipboard from 'copy-text-to-clipboard';
import { memo, useCallback, useContext, useMemo, useState } from 'react';
import { TUploadRespond } from '../../../../setting/type';
import Uploader from './upload';

const List = memo(() => {
  const [, setContext] = useContext(Context);
  const [respond, search] = useSearch();
  const [filter, setFilter] = useState('/');

  const currentData = useMemo(() => {
    if (respond && respond.res) {
      return respond.data
        .sort((a, b) => a.folder.length - b.folder.length)
        .reduce<Record<string, TUploadRespond[]>>((prev, next) => {
          const splitKey = next.folder.split('/');
          const currentKey = splitKey.length > 1 ? `/${splitKey.slice(1).join('/')}` : '/';
          if (prev[currentKey]) {
            prev[currentKey].push(next);
            return { ...prev };
          }
          return { ...prev, [currentKey]: [next] };
        }, {});
    }
    return {};
  }, [respond]);

  const filterData = useMemo(() => {
    if (currentData && currentData[filter]) return currentData[filter];
    return [];
  }, [currentData, filter]);

  const reload = useCallback(() => {
    search({ folder: '*' });
  }, []);

  const alertMessage = useCallback((status: boolean) => {
    if (status) {
      setContext({
        type: ActionType.Alert,
        state: {
          enabled: true,
          body: '網址已經複製到剪貼簿',
          type: AlertType.Success,
        },
      });
    } else {
      setContext({
        type: ActionType.Alert,
        state: {
          enabled: true,
          body: '剪貼簿功能不支援',
          type: AlertType.Error,
        },
      });
    }
  }, []);

  return (
    <div className='List'>
      <select
        className='select select-bordered select-xs w-full max-w-xs'
        onChange={(e) => setFilter(e.target.value)}
      >
        {Object.keys(currentData).map((item) => {
          const splitData = item.split('/');
          return (
            <option key={item} value={item}>
              {splitData.length > 1 ? `/${splitData.slice(1).join('/')}` : '/'}
            </option>
          );
        })}
      </select>
      {filterData.map((data) => {
        return (
          <div key={JSON.stringify(data)} className='relative w-full pb-[100%]'>
            <div className='absolute bottom-0 left-0 right-0 top-0'>
              <a
                className='prose'
                onClick={() => {
                  if (navigator.clipboard === undefined) {
                    if (copyTextToClipboard(data.secure_url)) alertMessage(true);
                    else alertMessage(false);
                  } else {
                    navigator.clipboard?.writeText?.(data.secure_url).then(
                      () => alertMessage(true),
                      () => alertMessage(false),
                    );
                  }
                }}
              >
                <img className='h-full w-full object-cover' src={data.secure_url} alt='' />
              </a>
            </div>
          </div>
        );
      })}
      <Uploader reload={reload} folder={filter} />
    </div>
  );
});
export default List;
