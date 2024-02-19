import { FunctionComponent, ReactElement, MouseEvent   } from 'react'
import classNames from 'classnames'

export interface ResetBtnProps{
    onClick: (e:MouseEvent<HTMLButtonElement>) => void
    invisble: boolean
}

const ResetBtn: FunctionComponent<ResetBtnProps> = ({ onClick, invisble }):ReactElement =>{
    return (
        <button className={classNames("btn","mr-2",{'invisible': invisble})} onClick={onClick}>
          Reset<i className="material-icon dark:text-zinc-900 text-neutral-300 pl-2">restart_alt</i>   
        </button>
    );
};

export default ResetBtn