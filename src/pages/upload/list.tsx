import useResource from '@/hooks/useResource';
import { memo, useEffect, useState } from 'react';
import Table from './table';
import { TUploadRespond } from '../../../setting/type';

const List = memo(() => {
  const [respond, getResource] = useResource();
  const [list, setList] = useState<TUploadRespond[]>();

  useEffect(() => {
    getResource();
  }, []);

  useEffect(() => {
    if (respond) {
      const { data } = respond;
      setList(data);
    }
  }, [respond]);
  return <div className='List'>{list && <Table data={list} />}</div>;
});
export default List;
