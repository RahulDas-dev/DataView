export enum ActionType {
    RESET_LOADER = 'RESETLOADER',
    RESET_FILE_AND_URL = 'RESETFILEANDURL',
    SET_LOAD_SCHEM_AS_FILE = 'SETUPLOADSCHEMASFILE',
    SET_LOAD_SCHEM_AS_URL = 'SETUPLOADSCHEMASURL',
    FILE_LOAD_INIT = 'FILELOADINIT',
    URL_LOAD_INIT = 'URLLOADINIT',
    SET_RESET_BTN_VISIBLE = 'SETRESETBTNVISIBLE',
    SET_FILE_OBJECT = 'SETFILEOBJECT',
    SET_FILE_URL = 'SETFILEURL',
    SET_ERROR = 'SETERROR',
    SET_UNKNOWN_ERROR = 'SETUNKNOWNERROR'
}

export interface Payload{
    file_object?: File
    file_url?:string,
    error?: string
}

export type Actions = {
    type: ActionType;
    payload?: Payload; 
}

export interface DataLoderState{
    file_url :string
    file_object: File|null
    file_load_scheme: boolean
    is_chkbox_disabled: boolean
    is_inputs_disabled: boolean
    is_restbtn_visible: boolean
    error: string
}

export const init_state: DataLoderState = {
    file_url: '',
    file_object: null,
    file_load_scheme: true,
    is_chkbox_disabled: false,
    is_inputs_disabled: false,
    is_restbtn_visible: false,
    error: ''
}

export const dataLoaderReducer = (state: DataLoderState, action: Actions): DataLoderState => {
    switch (action.type) {
        case ActionType.RESET_LOADER:
            return init_state;
        case ActionType.RESET_FILE_AND_URL:
            return { ...state, file_url: '',file_object: null };
        case ActionType.SET_LOAD_SCHEM_AS_FILE:
            return { ...state, file_load_scheme: true };  
        case ActionType.SET_LOAD_SCHEM_AS_URL:
            return { ...state, file_load_scheme: false};           
        case ActionType.FILE_LOAD_INIT:
            return { ...state, is_chkbox_disabled: true, is_inputs_disabled: true, is_restbtn_visible: false, error: ''};    
        case ActionType.URL_LOAD_INIT:
            return { ...state, is_chkbox_disabled: true, is_inputs_disabled: true, is_restbtn_visible: false, error:''};
        case ActionType.SET_RESET_BTN_VISIBLE:
            return { ...state, is_restbtn_visible: true};  
        case ActionType.SET_FILE_OBJECT:
            return { ...state, file_object: action.payload?.file_object||null};      
        case ActionType.SET_FILE_URL:
            return { ...state, file_url: action.payload?.file_url||''};  
        case ActionType.SET_ERROR:
            return { ...state, error: action.payload?.error||''};           
        case ActionType.SET_UNKNOWN_ERROR:
                return { ...state, error: 'Some Unknown Error .....'};         
        default:
            return state;
    }
  }