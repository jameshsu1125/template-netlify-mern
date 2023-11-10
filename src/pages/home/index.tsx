import { memo, useState } from 'react';
import { HomeContext, HomeState, THomeState } from './config';
import './index.less';
import { SETTING } from '../../../setting';
import Table from './table';

const Home = memo(() => {
  const [state, setState] = useState<THomeState>(HomeState);

  return (
    <div className='Home'>
      <HomeContext.Provider value={[state, setState]}>
        {SETTING.mongodb.map((data) => (
          <Table key={data.collection} data={[data]} />
        ))}
      </HomeContext.Provider>
    </div>
  );
});

export default Home;
