import Drawer from '@/components/drawer/index.tsx';
import LoadingProcess from '@/components/loadingProcess/index.tsx';
import useConnect from '@/hooks/useConnect.ts';
import useLogin from '@/hooks/useLogin.ts';
import { Context } from '@/settings/constant.ts';
import { ActionType } from '@/settings/type.ts';
import { useAuth0 } from '@auth0/auth0-react';
import { lazy, memo, Suspense, useCallback, useContext, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
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
    if (user) checkIdentified(user);
  }, [user]);

  useEffect(() => {
    if (state && state.res) {
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
