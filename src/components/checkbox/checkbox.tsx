import { FunctionComponent, ReactElement, ChangeEvent   } from 'react'


export interface CheckboxProps{
    label:string,
    value: boolean,
    onChange: (e:ChangeEvent<HTMLInputElement>) => void
    disabled: boolean
}

const Checkbox: FunctionComponent<CheckboxProps> = ({ label, value, onChange, disabled }):ReactElement =>{
    return (
        <div className="inline-flex items-center ml-1 mr-2">
            <input  type="checkbox"
                    checked={value} 
                    onChange={onChange}
                    disabled={disabled}
                    className="check-box"/>
            <label className="ms-2 text-sm font-mono font-medium text-neutral-600 dark:text-gray-300">{label}</label>
        </div>
      );
};

export default Checkbox