import Alert from '@/components/alert';
import LoadingProcess from '@/components/loadingProcess';
import Modal from '@/components/modal';
import { Context, InitialState, Reducer } from '@/settings/constant';
import { ActionType, TContext } from '@/settings/type';
import { Auth0Provider } from '@auth0/auth0-react';
import { useMemo, useReducer } from 'react';
import { BrowserRouter } from 'react-router-dom';
import RoutePages from './router';

const App = () => {
  const [state, setState] = useReducer(Reducer, InitialState);
  const value: TContext = useMemo(() => [state, setState], [state]);

  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
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
        {state[ActionType.LoadingProcess]?.enabled && <LoadingProcess />}
        {state[ActionType.Alert]?.enabled && <Alert />}
        {state[ActionType.modal]?.enabled && <Modal />}
      </Context.Provider>
    </Auth0Provider>
  );
};

export default App;
