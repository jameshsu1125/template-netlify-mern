import { useAuth0 } from '@auth0/auth0-react';
import { memo } from 'react';
import coverImage from './img/OT-integrations-logo-auth0.png';

const Login = memo(() => {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className='flex h-full w-full items-center justify-center'>
      <div className='card bg-base-300 w-96 shadow-xl'>
        <figure>
          <img src={coverImage} alt='logo' />
        </figure>
        <div className='card-body'>
          <h2 className='card-title'>登入 Auth0 以繼續</h2>
          <p>Auth0 身分識別平台允許您自訂登入服務，以符合您的業務需求、技術需求以及客戶群。</p>
          <div className='card-actions justify-end'>
            <button
              className='btn bg-base-content text-base-100'
              onClick={() => loginWithRedirect()}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
export default Login;
