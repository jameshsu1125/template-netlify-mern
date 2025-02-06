import { useAuth0 } from '@auth0/auth0-react';
import { memo } from 'react';
import coverImage from './img/OT-integrations-logo-auth0.png';

const Login = memo(() => {
  const { loginWithRedirect } = useAuth0();

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
