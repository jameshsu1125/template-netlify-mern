import { useAuth0 } from '@auth0/auth0-react';
import { memo } from 'react';

/**
 * shown when Auth0 signed the user in but the backend refused the access token.
 * it keeps the reason on screen and always offers a way out, so a failed login
 * can never trap the user on a page with no logout button.
 */
const LoginFailed = memo(({ msg }: { msg: string }) => {
  const { logout, loginWithRedirect } = useAuth0();

  return (
    <div className='flex h-full w-full items-center justify-center p-4'>
      <div className='card bg-base-300 w-full max-w-md shadow-xl'>
        <div className='card-body'>
          <h2 className='card-title'>無法進入後台</h2>
          <p className='text-sm'>Auth0 登入成功，但後端拒絕了這個 access token。</p>
          <div className='alert alert-error mt-2 text-sm break-all'>{msg}</div>
          <div className='card-actions mt-2 justify-end'>
            <button className='btn btn-ghost' onClick={() => logout()}>
              登出
            </button>
            <button
              className='btn bg-base-content text-base-100'
              onClick={() => loginWithRedirect()}
            >
              重新登入
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
export default LoginFailed;
