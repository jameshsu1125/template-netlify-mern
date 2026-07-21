import Alert from '@/components/alert';
import LoadingProcess from '@/components/loadingProcess';
import Modal from '@/components/modal';
import { Context, InitialState, Reducer } from '@/settings/constant';
import { ActionType } from '@/settings/type';
import { Auth0Provider } from '@auth0/auth0-react';
import { useReducer } from 'react';
import { BrowserRouter } from 'react-router-dom';
import RoutePages, { UserRoutePages } from './router';

const AdminApp = () => {
  const value = useReducer(Reducer, InitialState);
  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={
        location.hostname === 'localhost'
          ? import.meta.env.VITE_AUTH0_CLIENT_ID_DEV
          : import.meta.env.VITE_AUTH0_CLIENT_ID
      }
      authorizationParams={{
        redirect_uri: window.location.origin + '/admin',
      }}
    >
      <Context.Provider {...{ value }}>
        <div className='App'>
          <BrowserRouter basename='/admin'>
            <RoutePages />
          </BrowserRouter>
        </div>
        {value[0][ActionType.Modal].enabled && <Modal />}
        {value[0][ActionType.Alert].enabled && <Alert />}
        {value[0][ActionType.LoadingProcess]?.enabled && <LoadingProcess />}
      </Context.Provider>
    </Auth0Provider>
  );
};

const UserApp = () => {
  const value = useReducer(Reducer, InitialState);

  return (
    <Context.Provider {...{ value }}>
      <div className='App'>
        <BrowserRouter>
          <UserRoutePages />
        </BrowserRouter>
      </div>
      {value[0][ActionType.LoadingProcess]?.enabled && <LoadingProcess />}
    </Context.Provider>
  );
};

const App = () => {
  const isAdmin = location.pathname.startsWith('/admin');
  return isAdmin ? <AdminApp /> : <UserApp />;
};

export default App;
