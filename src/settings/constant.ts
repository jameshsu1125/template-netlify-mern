import { createContext } from 'react';
import {
  ActionType,
  AlertType,
  IAction,
  IState,
  LoadingProcessType,
  TAlertState,
  TContext,
  TLoadingProcessState,
  TModalState,
  TStatusState,
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
  type: AlertType.normal,
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

export const InitialState: IState = {
  [ActionType.LoadingProcess]: LoadingProcessState,
  [ActionType.Status]: StatusState,
  [ActionType.Alert]: AlertState,
  [ActionType.modal]: ModalState,
};

export const Context = createContext<TContext>([InitialState, () => {}]);
export const Reducer = (state: IState, action: IAction): IState => {
  if (action.state instanceof Object) {
    let stateStorage: { [key: string]: any } = {};
    Object.entries(action.state)
      .filter((actionState) => {
        const value = Object.values(ActionType).filter(
          (actionValue) => actionValue === actionState[0],
        );
        if (value.length > 0 || action.type) return true;
        return false;
      })
      .map((actionState) => {
        const value = Object.values(ActionType).filter(
          (actionValue) => actionValue === actionState[0],
        );
        if (value.length > 0) return actionState;
        return [action.type, Object.fromEntries([actionState])];
      })
      .forEach((actionState) => {
        if (actionState) {
          const [key, value] = actionState;
          const stringKey = String(key);
          const cloneVale = Object.fromEntries(
            Object.entries(state).filter((stateValue) => stateValue[0] === stringKey),
          )[action.type];
          if (Object.prototype.hasOwnProperty.call(stateStorage, stringKey)) {
            stateStorage = {
              [stringKey]: { ...stateStorage[stringKey], ...value },
            };
          } else stateStorage = { [stringKey]: { ...cloneVale, ...value } };
        }
      });
    return { ...state, ...stateStorage };
  }
  if (action.type) return { ...state, [action.type]: action.state };
  return state;
};
