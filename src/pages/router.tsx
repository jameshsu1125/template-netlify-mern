import Drawer from '@/components/drawer';
import LoadingProcess from '@/components/loadingProcess';
import useConnect from '@/hooks/useConnect';
import useLogin from '@/hooks/useLogin';
import { Context } from '@/settings/constant';
import { setTokenGetter } from '@/settings/fetcher';
import { ActionType } from '@/settings/type';
import { useAuth0 } from '@auth0/auth0-react';
import { lazy, memo, Suspense, useCallback, useContext, useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import Album from './album';
import Editor from './editor';
import Error from './error';
import Home from './home';
import Login from './login';
import LoginFailed from './login/failed';
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
  const [failure, setFailure] = useState<string | undefined>();
  const { user, getAccessTokenSilently, loginWithRedirect } = useAuth0();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'valentine');
  }, []);

  // registered before any request so every call carries a fresh access token
  useEffect(() => {
    setTokenGetter(
      () => getAccessTokenSilently(),
      () => loginWithRedirect(),
    );
    return () => setTokenGetter(undefined);
  }, [getAccessTokenSilently, loginWithRedirect]);

  useEffect(() => {
    if (user) checkIdentified();
  }, [user]);

  useEffect(() => {
    if (!state) return;
    if (!state.res) {
      // keep the reason on screen instead of bouncing to '/', where there is no logout button
      setFailure(state.msg || 'Login failed.');
      return;
    }
    getAccessTokenSilently()
      .then((token) => {
        setContext({
          type: ActionType.User,
          state: {
            token: token || '',
            email: state.email || user?.email,
            name: user?.name,
            picture: user?.picture,
            type: state.type,
          },
        });
      })
      .catch(() => loginWithRedirect());
  }, [state]);

  if (failure) return <LoginFailed msg={failure} />;

  return <>{context[ActionType.User].token ? <DrawerPage /> : <LoadingProcess />}</>;
});

const RoutePages = memo(() => {
  const { isLoading, user, error } = useAuth0();
  const [res, getConnect] = useConnect();

  useEffect(() => {
    if (!res) getConnect();
  }, [res]);

  // Auth0 itself refused the request (bad audience, unauthorized client, consent needed).
  // without this the user is sent back to <Login /> and loops forever with no reason shown.
  if (error) return <LoginFailed msg={error.message} />;

  return <>{(isLoading && <LoadingProcess />) || (user && <UserPage />) || <Login />}</>;
});

export default RoutePages;

export const UserRoutePages = memo(() => {
  const ComponentLoader = useCallback(() => {
    const Element = lazy(() => import('./home/index.tsx'));
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
