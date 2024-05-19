import { FunctionComponent, ReactElement, MouseEvent   } from 'react'

export interface ExpandBtnProps{
    onClick: (e:MouseEvent<HTMLButtonElement>) => void
    expanded: boolean
}

const ExpandBtn: FunctionComponent<ExpandBtnProps> = ({ expanded, onClick }):ReactElement =>{
    return (
        <button className="btn-icon px-4 py-3.5" onClick={onClick}>
            {expanded && <i className="material-icon dark:text-zinc-900 text-neutral-300 ">arrow_upward</i>}
            {!expanded && <i className="material-icon dark:text-zinc-900 text-neutral-300" >arrow_downward</i>}
        </button>
    );
};

export default ExpandBtn
