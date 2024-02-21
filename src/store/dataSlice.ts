import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { DataFrame  } from "danfojs"

interface IData{
    data: DataFrame
}

const initialState: IData = {
  data: new DataFrame()
}

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setData: (state, action: PayloadAction<IData>) => {
        state.data = action.payload
    }
    
  },
})

export const { setData} = dataSlice.actions
export default dataSlice.reducer