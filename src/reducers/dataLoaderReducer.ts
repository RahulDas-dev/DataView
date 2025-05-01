export enum ActionType {
  RESET_LOADER = 'RESET_LOADER',
  RESET_FILE_AND_URL = 'RESET_FILE_AND_URL',
  SET_LOAD_SCHEM_AS_FILE = 'SET_LOAD_SCHEM_AS_FILE',
  SET_LOAD_SCHEM_AS_URL = 'SET_LOAD_SCHEM_AS_URL',
  SET_FILE_URL = 'SET_FILE_URL',
  SET_FILE_OBJECT = 'SET_FILE_OBJECT',
  URL_LOAD_INIT = 'URL_LOAD_INIT',
  SET_ERROR = 'SET_ERROR',
  CLEAR_ERROR = 'CLEAR_ERROR',
  SET_UNKNOWN_ERROR = 'SET_UNKNOWN_ERROR',
  SET_RESET_BTN_VISIBLE = 'SET_RESET_BTN_VISIBLE',
}

// Define the state type
export interface DataLoaderState {
  file_load_scheme: boolean;
  file_url: string;
  file_object: File | null;
  error: string;
  is_inputs_disabled: boolean;
  is_chkbox_disabled: boolean;
  is_restbtn_visible: boolean;
}

// Initial state for the reducer
export const init_state: DataLoaderState = {
  file_load_scheme: true,
  file_url: '',
  file_object: null,
  error: '',
  is_inputs_disabled: false,
  is_chkbox_disabled: false,
  is_restbtn_visible: false,
};

// Define action type
export type DataLoaderAction = {
  type: ActionType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
};

// Reducer function
export const dataLoaderReducer = (
  state: DataLoaderState,
  action: DataLoaderAction
): DataLoaderState => {
  switch (action.type) {
    case ActionType.RESET_LOADER:
      return init_state;
    case ActionType.RESET_FILE_AND_URL:
      return { ...state, file_url: '', file_object: null, error: '' };
    case ActionType.SET_LOAD_SCHEM_AS_FILE:
      return { ...state, file_load_scheme: true };
    case ActionType.SET_LOAD_SCHEM_AS_URL:
      return { ...state, file_load_scheme: false };
    case ActionType.SET_FILE_URL:
      return { ...state, file_url: action.payload.file_url };
    case ActionType.SET_FILE_OBJECT:
      return { ...state, file_object: action.payload.file_object };
    case ActionType.URL_LOAD_INIT:
      return { ...state, is_inputs_disabled: true, is_chkbox_disabled: true, error: '' };
    case ActionType.SET_ERROR:
      return {
        ...state,
        error: action.payload.error,
        is_inputs_disabled: false,
        is_chkbox_disabled: false,
      };
    case ActionType.CLEAR_ERROR:
      return {
        ...state,
        error: '',
      };
    case ActionType.SET_UNKNOWN_ERROR:
      return {
        ...state,
        error: 'Unknown error occurred',
        is_inputs_disabled: false,
        is_chkbox_disabled: false,
      };
    case ActionType.SET_RESET_BTN_VISIBLE:
      return {
        ...state,
        is_restbtn_visible: true,
        is_inputs_disabled: false,
        is_chkbox_disabled: true,
      };
    default:
      return state;
  }
};
