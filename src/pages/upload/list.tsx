import useResource from '@/hooks/useResource';
import { memo, useEffect } from 'react';

const List = memo(() => {
  const [respond, getResource] = useResource();

  useEffect(() => {
    getResource();
  }, []);

  useEffect(() => {
    if (respond) console.log(respond.data[0].secure_url);
  }, [respond]);
  return <div className='List'>List</div>;
});
export default List;
