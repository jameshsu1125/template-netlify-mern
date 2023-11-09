import { memo, useEffect } from 'react';
import './index.less';
import { SETTING } from '../../../setting';

const Todo = memo((data: (typeof SETTING.mongodb)[0]) => {
  useEffect(() => {}, []);
  console.log(data);

  return <div className='Todo'>{''}</div>;
});
export default Todo;
