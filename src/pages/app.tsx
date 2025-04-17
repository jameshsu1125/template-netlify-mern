import Alert from '@/components/alert';
import LoadingProcess from '@/components/loadingProcess';
import Modal from '@/components/modal';
import { Context, InitialState, Reducer } from '@/settings/constant';
import { ActionType } from '@/settings/type';
import { Auth0Provider } from '@auth0/auth0-react';
import { useReducer } from 'react';
import { BrowserRouter } from 'react-router-dom';
import RoutePages from './router';

const App = () => {
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
        redirect_uri: window.location.origin,
      }}
    >
      <Context.Provider {...{ value }}>
        <div className='App'>
          <BrowserRouter>
            <RoutePages />
          </BrowserRouter>
        </div>
        {value[0][ActionType.LoadingProcess]?.enabled && <LoadingProcess />}
        {value[0][ActionType.Alert]?.enabled && <Alert />}
        {value[0][ActionType.Modal]?.enabled && <Modal />}
      </Context.Provider>
    </Auth0Provider>
  );
};

export default App;
