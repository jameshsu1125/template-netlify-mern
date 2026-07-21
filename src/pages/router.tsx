import Drawer from '@/components/drawer';
import LoadingProcess from '@/components/loadingProcess';
import useConnect from '@/hooks/useConnect';
import useLogin from '@/hooks/useLogin';
import { Context } from '@/settings/constant';
import { ActionType } from '@/settings/type';
import { useAuth0 } from '@auth0/auth0-react';
import { lazy, memo, Suspense, useCallback, useContext, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import Album from './album';
import Editor from './editor';
import Error from './error';
import Home from './home';
import Login from './login';
import User from './user';

const DrawerPage = memo(() => {
  const ComponentLoader = useCallback(() => {
    const Element = lazy(() => import('./error/index.tsx'));
    if (!Element) return null;
    return (
      <Suspense fallback=''>
        <Element />
      </Suspense>
    );
  }, []);

  return (
    <Drawer>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/home' element={<Home />} />
        <Route path='/user' element={<User />} />
        <Route path='/album' element={<Album />} />
        <Route path='/editor' element={<Editor />} />
        <Route path='*' element={ComponentLoader()} />
      </Routes>
    </Drawer>
  );
});

const UserPage = memo(() => {
  const [context, setContext] = useContext(Context);
  const [state, checkIdentified] = useLogin();
  const { user } = useAuth0();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'valentine');
  }, []);

  useEffect(() => {
    if (user) checkIdentified(user);
  }, [user]);

  useEffect(() => {
    if (state) {
      if (state.res) {
        setContext({
          type: ActionType.User,
          state: {
            token: state.token || '',
            email: user?.email,
            name: user?.name,
            picture: user?.picture,
            type: state.type,
          },
        });
      } else {
        window.location.href = '/';
      }
    }
  }, [state]);

  return <>{context[ActionType.User].token ? <DrawerPage /> : <LoadingProcess />}</>;
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

export const UserRoutePages = memo(() => {
  const ComponentLoader = useCallback(() => {
    const Element = lazy(() => import('./game/index.tsx'));
    if (!Element) return null;
    return (
      <Suspense fallback=''>
        <Element />
      </Suspense>
    );
  }, []);
  return (
    <Routes>
      <Route path='/' element={ComponentLoader()} />
      <Route path='*' element={<Error />} />
    </Routes>
  );
});
