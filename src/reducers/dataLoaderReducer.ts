// Define action types
export enum ActionType {
  SET_UPLOAD_TYPE = 'SET_UPLOAD_TYPE',
  SET_SETTINGS_OPEN = 'SET_SETTINGS_OPEN',
  SET_SETTINGS_CLOSE = 'SET_SETTINGS_CLOSE',
  SET_FILE_OBJECT = 'SET_FILE_OBJECT',
  SET_FILE_URL = 'SET_FILE_URL',
  PROCESS_START = 'PROCESS_START',
  PROCESS_LOADING = 'PROCESS_LOADING',
  PROCESS_ERROR = 'PROCESS_ERROR',
  PROCESS_SUCCESS = 'PROCESS_SUCCESS',
  RESET = 'RESET',
}

// Define the state type
export interface DataLoaderState {
  uploadType: 'file' | 'url';
  isSettingsOpen: boolean;
  showResetButton: boolean;
  disableProcesBtn: boolean;
  disableFileInput: boolean;
  disableCheckBox: boolean;
  error: Error | null;
  fileInput: File | null;
  fileUrl: string;
  isLoading: boolean;
  loadingStatus: string;
}

// Define payload types for actions
type SetUploadTypePayload = {
  uploadType: 'file' | 'url';
};

type SetFileObjectPayload = {
  file_object: File | null;
};

type SetFileUrlPayload = {
  file_url: string;
};

type ProcessLoadingPayload = {
  status: string;
};

type ProcessErrorPayload = {
  error: Error;
};

// Define action interfaces
interface SetUploadTypeAction {
  type: ActionType.SET_UPLOAD_TYPE;
  payload: SetUploadTypePayload;
}

interface SetSettingsOpenAction {
  type: ActionType.SET_SETTINGS_OPEN;
  payload: { isOpen: boolean };
}

interface SetSettingsCloseAction {
  type: ActionType.SET_SETTINGS_CLOSE;
  payload: { isOpen: boolean };
}

interface SetFileObjectAction {
  type: ActionType.SET_FILE_OBJECT;
  payload: SetFileObjectPayload;
}

interface SetFileUrlAction {
  type: ActionType.SET_FILE_URL;
  payload: SetFileUrlPayload;
}

interface ProcessStartAction {
  type: ActionType.PROCESS_START;
}

interface ProcessLoadingAction {
  type: ActionType.PROCESS_LOADING;
  payload: ProcessLoadingPayload;
}

interface ProcessErrorAction {
  type: ActionType.PROCESS_ERROR;
  payload: ProcessErrorPayload;
}

interface ProcessSuccessAction {
  type: ActionType.PROCESS_SUCCESS;
}

interface ResetAction {
  type: ActionType.RESET;
}

// Union type for all actions
export type DataLoaderAction =
  | SetUploadTypeAction
  | SetSettingsOpenAction
  | SetSettingsCloseAction
  | SetFileObjectAction
  | SetFileUrlAction
  | ProcessStartAction
  | ProcessLoadingAction
  | ProcessErrorAction
  | ProcessSuccessAction
  | ResetAction;

// Initial state
export const init_state: DataLoaderState = {
  uploadType: 'file',
  isSettingsOpen: false,
  showResetButton: false,
  disableProcesBtn: true,
  disableFileInput: false,
  disableCheckBox: false,
  error: null,
  fileInput: null,
  fileUrl: '',
  isLoading: false,
  loadingStatus: '',
};

// Reducer function
export const dataLoaderReducer = (
  state: DataLoaderState,
  action: DataLoaderAction
): DataLoaderState => {
  switch (action.type) {
    case ActionType.SET_UPLOAD_TYPE:
      return {
        ...state,
        uploadType: action.payload.uploadType,
        fileInput: null,
        fileUrl: '',
        error: null,
        disableProcesBtn: true,
      };

    case ActionType.SET_SETTINGS_OPEN:
      return {
        ...state,
        isSettingsOpen: action.payload.isOpen,
      };

    case ActionType.SET_SETTINGS_CLOSE:
      return {
        ...state,
        isSettingsOpen: action.payload.isOpen,
      };

    case ActionType.SET_FILE_OBJECT:
      return {
        ...state,
        fileInput: action.payload.file_object,
        disableProcesBtn: action.payload.file_object ? false : true,
        error: null,
      };

    case ActionType.SET_FILE_URL:
      return {
        ...state,
        fileUrl: action.payload.file_url,
        disableProcesBtn: action.payload.file_url ? false : true,
        error: null,
      };

    case ActionType.PROCESS_START:
      return {
        ...state,
        disableProcesBtn: true,
        disableFileInput: true,
        showResetButton: false,
        disableCheckBox: true,
        error: null,
        isLoading: true,
        loadingStatus: 'Starting...',
      };

    case ActionType.PROCESS_LOADING:
      return {
        ...state,
        loadingStatus: action.payload.status,
      };

    case ActionType.PROCESS_ERROR:
      return {
        ...state,
        showResetButton: true,
        disableFileInput: false,
        error: action.payload.error,
        isLoading: false,
        loadingStatus: '',
      };

    case ActionType.PROCESS_SUCCESS:
      return {
        ...state,
        showResetButton: true,
        isLoading: false,
        loadingStatus: '',
      };

    case ActionType.RESET:
      return {
        ...state,
        disableProcesBtn: true,
        disableFileInput: false,
        disableCheckBox: false,
        showResetButton: false,
        fileInput: null,
        fileUrl: '',
        error: null,
        isLoading: false,
        loadingStatus: '',
      };

    default:
      return state;
  }
};
