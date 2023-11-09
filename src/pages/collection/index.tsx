import Table from '@/components/table';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SETTING } from '../../../setting';
import './index.less';
import InsertGroup from '@/components/insertGroup';
import { CollectionContext, CollectionState, TCollectionState } from './config';

interface RefObject {
  update: () => void;
}

const Collection = memo(() => {
  const value = useState<TCollectionState>(CollectionState);
  const [, setState] = value;

  const tableRef = useRef<RefObject>(null);

  const { pathname } = useLocation();
  const table = pathname.slice(1);

  const [collection] = SETTING.mongodb.filter((collection) => collection.table === table);
  const { type } = collection;

  useEffect(() => {
    setState((S) => ({ ...S, page: table }));
  }, [table]);

  const onSubmit = useCallback(() => {
    tableRef.current?.update();
  }, []);

  return (
    <CollectionContext.Provider value={value}>
      <div className='Table max-w-7xl'>
        <h2 className='uppercase'>{table}</h2>
        <Table ref={tableRef} type={collection.type} table={table} />
        <InsertGroup type={type} table={table} onSubmit={onSubmit} />
      </div>
    </CollectionContext.Provider>
  );
});
export default Collection;
