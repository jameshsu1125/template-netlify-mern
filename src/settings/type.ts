import { Dispatch, ReactNode } from 'react';
import { Debug } from './type-unity';

export enum ActionType {
  LoadingProcess = 'loadingProcess',
  Status = 'status',
  Alert = 'alert',
  Modal = 'modal',
  User = 'user',
}

export enum LoadingProcessType {
  Ball = 'balls',
  Bars = 'bars',
  Bubbles = 'bubbles',
  Cubes = 'cubes',
  Cylon = 'cylon',
  Spin = 'spin',
  SpinningBubbles = 'spinningBubbles',
  Spokes = 'spokes',
}

export enum TransitionType {
  Unset = 0,
  FadeIn = 1,
  FadeOut = 2,
  DidFadeIn = 3,
  DidFadeOut = 4,
  Loop = 5,
  Stop = 6,
}

export enum AlertType {
  Normal = '',
  Info = 'alert-info',
  Success = 'alert-success',
  Warning = 'alert-warning',
  Error = 'alert-error',
}

export enum UserType {
  Admin = 'admin',
  InHouse = 'inHouse',
  User = 'user',
  Guest = 'guest',
}

export interface IEnabled {
  enabled: boolean;
}

export type TLoadingProcessState = Debug<
  IEnabled & {
    type: LoadingProcessType;
    body: ReactNode;
  }
>;

export type TAlertState = Debug<
  IEnabled & {
    type: AlertType;
    body: ReactNode;
    time: number;
  }
>;

export type TStatusState = Debug<IEnabled>;

export type TModalState = Debug<
  IEnabled & {
    title: string;
    body: ReactNode;
    label: string[] | string;
    storage: any;
    onClose: (label: string) => void;
  }
>;

export type TUserState = {
  token: string;
  email: string;
  name: string;
  picture: string;
  type: UserType;
};

export interface IState {
  loadingProcess: TLoadingProcessState;
  status: TStatusState;
  alert: TAlertState;
  modal: TModalState;
  user: TUserState;
}

export interface IAction {
  state:
    | Partial<IState>
    | Partial<TLoadingProcessState>
    | Partial<TStatusState>
    | Partial<TAlertState>
    | Partial<TModalState>
    | Partial<TUserState>;
  type: ActionType;
}

export type TContext = [IState, Dispatch<IAction>];

export interface IReactProps {
  readonly children?: ReactNode;
}
