export enum EColTypes{
    Numerical = "Numerical",
    Categorical = "Categorical",
}

export interface EcolumnProps{
    colname: string| number
    dtype: EColTypes
    expand: boolean
}