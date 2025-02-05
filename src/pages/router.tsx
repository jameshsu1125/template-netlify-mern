import Album from '@/components/album/index.tsx';
import Drawer from '@/components/drawer/index.tsx';
import Navbar from '@/components/navbar/index.tsx';
import useConnect from '@/hooks/useConnect.ts';
import { Context } from '@/settings/constant.ts';
import { useAuth0 } from '@auth0/auth0-react';
import { lazy, memo, Suspense, useCallback, useContext, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import EditorPage from './editor/index.tsx';
import Home from './home/index.tsx';
import Login from './login/index.tsx';
import { ActionType } from '@/settings/type.ts';
import { log } from 'node:console';

const RoutePages = memo(() => {
  const { isLoading, error, user } = useAuth0();
  const navigate = useNavigate();

  console.log(user, isLoading, error);

  const [context, setContext] = useContext(Context);
  const [res, getConnect] = useConnect();

  useEffect(() => {
    if (!res) getConnect();
  }, [res]);

  useEffect(() => {
    if (user && !isLoading)
      setContext({ type: ActionType.LoadingProcess, state: { enabled: false } });
  }, [user, isLoading]);

  const ComponentLoader = useCallback(() => {
    const Element = lazy(() => import('./collection/index.tsx'));
    if (!Element) return null;
    return <></>;
    return (
      <Suspense fallback=''>
        <Element />
      </Suspense>
    );
  }, []);

  return (
    <>
      {(isLoading && <div>loading</div>) ||
        (user && (
          <Drawer>
            <Navbar />
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/home' element={<Home />} />
              <Route path='/album' element={<Album />} />
              <Route path='/editor' element={<EditorPage />} />
              <Route path='*' element={ComponentLoader()} />
            </Routes>
          </Drawer>
        )) || <Login />}
    </>
  );
});

export default RoutePages;
