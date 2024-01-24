import { memo, useEffect } from 'react';
import { TUploadRespond } from '../../../../setting/type';

type T = {
  setFilter: React.Dispatch<React.SetStateAction<string>>;
  data: Record<string, TUploadRespond[]>;
};

const Filter = memo(({ setFilter, data }: T) => {
  useEffect(() => {}, []);
  return (
    <select
      className='select select-bordered select-xs w-full max-w-xs'
      onChange={(e) => setFilter(e.target.value)}
    >
      {Object.keys(data).map((item) => {
        const splitData = item.split('/');
        return (
          <option key={item} value={item}>
            {splitData.length > 1 ? `/${splitData.slice(1).join('/')}` : '/'}
          </option>
        );
      })}
    </select>
  );
});
export default Filter;
