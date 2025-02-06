import Album from '@/components/album/index.tsx';
import Drawer from '@/components/drawer/index.tsx';
import LoadingProcess from '@/components/loadingProcess/index.tsx';
import Navbar from '@/components/navbar/index.tsx';
import useConnect from '@/hooks/useConnect.ts';
import useSelect from '@/hooks/useSelect.ts';
import { useAuth0 } from '@auth0/auth0-react';
import { lazy, memo, Suspense, useCallback, useContext, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { SETTING, TType } from '../../setting/index.ts';
import EditorPage from './editor/index.tsx';
import Home from './home/index.tsx';
import Login from './login/index.tsx';
import { Context } from '@/settings/constant.ts';
import { ActionType, UserType } from '@/settings/type.ts';
import User from '@/components/user/index.tsx';

const DrawerPage = memo(() => {
  const ComponentLoader = useCallback(() => {
    const Element = lazy(() => import('./collection/index.tsx'));
    if (!Element) return null;
    return (
      <Suspense fallback=''>
        <Element />
      </Suspense>
    );
  }, []);

  return (
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
  );
});

const UserPage = memo(() => {
  const [, setContext] = useContext(Context);
  const [state, checkIdentified] = useSelect();
  const { user } = useAuth0();

  useEffect(() => {
    if (user) checkIdentified({ collection: SETTING.mongodb[0].collection });
  }, [user]);

  useEffect(() => {
    if (state) {
      const data = state.data as Extract<TType, { type: string }>[];
      data.forEach((item) => {
        if (item.email === user?.email) {
          if (item.type)
            setContext({
              type: ActionType.user,
              state: {
                type: item.type as UserType,
                email: item.email,
                name: user.name,
                picture: user.picture,
              },
            });
        }
      });
    }
  }, [state]);

  return (
    <User>
      <DrawerPage />
    </User>
  );
});

const RoutePages = memo(() => {
  const { isLoading, user } = useAuth0();
  const [res, getConnect] = useConnect();

  useEffect(() => {
    if (!res) getConnect();
  }, [res]);

  return <>{(isLoading && <LoadingProcess />) || (user && <UserPage />) || <Login />}</>;
});

export default RoutePages;
