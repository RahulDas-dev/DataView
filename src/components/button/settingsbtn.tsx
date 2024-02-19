import { FunctionComponent, ReactElement, MouseEvent   } from 'react'

export interface SettingsBtnProps{
    onClick: (e:MouseEvent<HTMLButtonElement>) => void
}

const SettingsBtn: FunctionComponent<SettingsBtnProps> = ({ onClick }):ReactElement =>{
    return (
        <button className="btn-icon " onClick={onClick}>
            <i className="material-icon text-zinc-900 dark:text-neutral-300">settings</i>
        </button>
    );
};

export default SettingsBtn
