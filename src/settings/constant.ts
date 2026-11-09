import { createContext } from 'react';
import {
  ActionType,
  AlertType,
  IAction,
  IState,
  LoadingProcessType,
  TAlbumState,
  TAlertState,
  TContext,
  TLoadingProcessState,
  TModalState,
  TStatusState,
  TUserState,
  UserType,
} from './type';

export const LoadingProcessState: TLoadingProcessState = {
  enabled: false,
  type: LoadingProcessType.Spokes,
  body: 'loading',
};

export const StatusState: TStatusState = {
  enabled: false,
};

export const AlertState: TAlertState = {
  enabled: false,
  type: AlertType.Normal,
  body: 'message',
  time: 5000,
};

export const ModalState: TModalState = {
  enabled: false,
  title: 'title',
  body: 'message',
  label: 'close',
  storage: {},
  onClose: () => {},
};

export const UserState: TUserState = {
  type: UserType.Guest,
  name: 'guest',
  email: 'demo@host.com',
  picture: 'https://www.gravatar.com/avatar/',
  token: '',
};

export const AlbumState: TAlbumState = {
  folder: '*',
  copiedText: '',
};

export const InitialState: IState = {
  [ActionType.LoadingProcess]: LoadingProcessState,
  [ActionType.Status]: StatusState,
  [ActionType.Alert]: AlertState,
  [ActionType.Modal]: ModalState,
  [ActionType.User]: UserState,
  [ActionType.Album]: AlbumState,
};

export const Context = createContext<TContext>([InitialState, () => {}]);
export const Reducer = (state: IState, action: IAction): IState => {
  const { type, state: payload } = action;
  // 物件：淺層合併進 state[type]；其他（如頁面字串）：整個取代
  if (payload instanceof Object)
    return { ...state, [type]: { ...(state[type] as object), ...payload } };
  return { ...state, [type]: payload };
};
