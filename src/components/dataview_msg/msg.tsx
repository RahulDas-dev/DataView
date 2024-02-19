import { FunctionComponent, ReactElement   } from 'react'


const Message: FunctionComponent = ():ReactElement =>{
  return (
    <div className="mt-20 text-justify font-mono">
        <h1 className="text-lg   mb-2">Welcome to DataView app! Explore, Modify, Analyze ... </h1>
        <ul className='pl-8 tracking-wide list-disc text-sm space-y-1'>
            <li> Effortless Data Loading - Instantly load data from any URL or CSV file</li>
            <li> Intuitive Modification - Easily tweak and tailor your data to your exact specifications.</li>
            <li> Comprehensive Statistics - Dive deep into a variety of statistics generated from your customized data.</li>
            <li> Empowerment Through Data - Harness the power of easy data manipulation for enhanced productivity.</li>
        </ul>
    </div>
  )
};

export default Message