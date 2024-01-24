import useSearch from '@/hooks/useSearch';
import { memo, useCallback, useMemo, useState } from 'react';
import { TUploadRespond } from '../../../../setting/type';
import Filter from './filter';
import Uploader from './upload';
import Photos from './photo';

const List = memo(() => {
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

  return (
    <div className='List'>
      <Filter data={currentData} setFilter={setFilter} />
      <Photos data={filterData} />
      <Uploader reload={reload} folder={filter} />
    </div>
  );
});
export default List;
