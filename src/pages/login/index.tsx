import useLogin, { TArgument } from '@/hooks/useLogin';
import { SETTING } from '../../../setting';
import { Context } from '@/settings/constant';
import { ActionType } from '@/settings/type';
import Storage from 'lesca-local-storage';
import { FormEvent, memo, useCallback, useContext, useEffect } from 'react';
import coverImage from './img/OT-integrations-logo-auth0.png';
import { useAuth0 } from '@auth0/auth0-react';

const Login = memo(() => {
  const [, setContext] = useContext(Context);
  const [respond, fetchLogin] = useLogin();

  const { loginWithRedirect } = useAuth0();

  const onSubmit = useCallback((event: FormEvent) => {
    event.preventDefault();
    const data = Object.fromEntries([
      ...new FormData(event.target as HTMLFormElement),
    ]) as TArgument;
    fetchLogin(data);
  }, []);

  useEffect(() => {
    if (respond?.res) {
      Storage.set(SETTING.dashboard.session.name, respond);
      setContext({ type: ActionType.Status, state: { enabled: true } });
    }
  }, [respond]);

  return (
    <div className='flex h-full w-full items-center justify-center'>
      <div className='card w-96 bg-base-300 shadow-xl'>
        <figure>
          <img src={coverImage} alt='logo' />
        </figure>
        <div className='card-body'>
          <h2 className='card-title'>Login Auth0 to continue</h2>
          <p>
            The Auth0 identity platform allows you to customize login services to fit your business,
            your technology, and your customer base.
          </p>
          <div className='card-actions justify-end'>
            <button className='btn btn-primary' onClick={() => loginWithRedirect()}>
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
export default Login;
