import { FunctionComponent, ReactElement, ChangeEvent,useId   } from 'react'


export interface CheckboxProps{
    label:string,
    value: boolean,
    onChange: (e:ChangeEvent<HTMLInputElement>) => void
    disabled: boolean
}

const Checkbox: FunctionComponent<CheckboxProps> = ({ label, value, onChange, disabled }):ReactElement =>{
    const chkboxId = useId();
    return (
        <div className="inline-flex items-center mr-3">
            <input  type="checkbox"
                    checked={value} 
                    onChange={onChange}
                    disabled={disabled}
                    id = {chkboxId}
                    className="check-box relative peer"/>
            <label htmlFor={chkboxId} className="ms-2 text-sm font-mono font-medium text-neutral-700 dark:text-neutral-300">{label}</label>
            <svg className="absolute w-4 h-4 hidden peer-checked:block pointer-events-none stroke-white"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        </div>
      );
};

export default Checkbox