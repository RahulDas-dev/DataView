import { FunctionComponent, ReactElement   } from 'react'
import './pogress.css';

export interface ProgressBarProps{
    disabled: boolean
}

const ProgressBar: FunctionComponent<ProgressBarProps> = ({ disabled }):ReactElement =>{
    return (
        <div className='w-full h-[1px] bg-inherit'>
            {disabled && <div className='h-[1px] w-full bg-inherit overflow-hidden'>
                <div className='progress w-full h-full bg-neutral-800 left-right'></div>
            </div>}
        </div>
    );
};

export default ProgressBar
