import { memo, useEffect } from 'react';

const Error = memo(() => {
  useEffect(() => {}, []);
  return <div className='w-full'>Error</div>;
});
export default Error;
