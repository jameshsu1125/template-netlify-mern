import { Dispatch, ReactNode } from 'react';

export type Prettify<T> = { [P in keyof T]: T[P] };
export type ReadyOnlyProps<T> = { readonly [P in keyof T]: T[P] };
export type Extension<T, E> = T & E;

export enum ActionType {
  LoadingProcess = 'loadingProcess',
  Status = 'status',
  Alert = 'alert',
  modal = 'modal',
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
  normal = '',
  Info = 'alert-info',
  Success = 'alert-success',
  Warning = 'alert-warning',
  Error = 'alert-error',
}

export interface IEnabled {
  enabled: boolean;
}

export type TLoadingProcessState = Prettify<
  IEnabled & {
    type: LoadingProcessType;
    body: ReactNode;
  }
>;

export type TAlertState = Prettify<
  IEnabled & {
    type: AlertType;
    body: ReactNode;
    time: number;
  }
>;

export type TStatusState = Prettify<IEnabled>;

export type TModalState = Prettify<
  IEnabled & {
    title: string;
    body: ReactNode;
    label: string;
    storage: any;
    onClose: () => void;
  }
>;

export interface IState {
  loadingProcess: TLoadingProcessState;
  status: TStatusState;
  alert: TAlertState;
  modal: TModalState;
}

export interface IAction {
  state:
    | Partial<IState>
    | Partial<TLoadingProcessState>
    | Partial<TStatusState>
    | Partial<TAlertState>
    | Partial<TModalState>;
  type: ActionType;
}

export type TContext = [IState, Dispatch<IAction>];

export interface IReactProps {
  readonly children?: ReactNode;
}
