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

  const collectionRef = useRef<RefObject>(null);

  const { pathname } = useLocation();
  const collection = pathname.slice(1);

  const [col] = SETTING.mongodb.filter((c) => c.collection === collection);
  const { schema } = col;

  useEffect(() => {
    setState((S) => ({ ...S, page: collection }));
  }, [collection]);

  const onSubmit = useCallback(() => {
    collectionRef.current?.update();
  }, []);

  return (
    <CollectionContext.Provider value={value}>
      <div className='Collection p-5'>
        <div className='mockup-code w-full'>
          <pre className='p-5'>
            <code>
              <h2 className='uppercase'>{collection}</h2>
              <Table ref={collectionRef} type={schema} collection={collection} />
              <InsertGroup type={schema} collection={collection} onSubmit={onSubmit} />
            </code>
          </pre>
        </div>
      </div>
    </CollectionContext.Provider>
  );
});
export default Collection;
