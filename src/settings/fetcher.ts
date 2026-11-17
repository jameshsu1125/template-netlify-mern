import Fetcher from 'lesca-fetcher';

type TTokenGetter = () => Promise<string | undefined>;

let tokenGetter: TTokenGetter | undefined;
let onTokenFailure: (() => Promise<void> | void) | undefined;
let redirecting = false;

/**
 * registers the Auth0 token getter used before every request.
 * call it once inside the Auth0Provider, pass no argument to clear it.
 */
export const setTokenGetter = (getter?: TTokenGetter, onFailure?: () => Promise<void> | void) => {
  tokenGetter = getter;
  onTokenFailure = onFailure;
  redirecting = false;
};

/**
 * refreshes the Authorization header so an expired access token renews itself.
 * returns false when the silent refresh failed and a new login is on its way.
 */
const refreshJWT = async () => {
  if (!tokenGetter) return true;
  try {
    const token = await tokenGetter();
    if (token) Fetcher.setJWT(token);
    return true;
  } catch {
    // login_required / consent_required: ask for a new login and stop here,
    // sending the request anyway would answer 401 and bounce the user to '/'
    if (!onTokenFailure) return true;
    if (!redirecting) {
      redirecting = true;
      await onTokenFailure();
    }
    return false;
  }
};

/** never settles, so the caller keeps waiting while the page navigates to Auth0 */
const pending = <T>() => new Promise<T>(() => {});

export const post = async <T>(path: string, body: object = {}) => {
  if (!(await refreshJWT())) return pending<T>();
  return (await Fetcher.post(path, body)) as T;
};

export const get = async <T>(path: string) => {
  if (!(await refreshJWT())) return pending<T>();
  return (await Fetcher.get(path)) as T;
};
