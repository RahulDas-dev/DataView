export interface ILayout{
    // title: "Table displaying the Titanic dataset",
    automargin: boolean,
    // height: 200,
    autosize: boolean,
    margin: {t:number, r:number, b:number, l:number, autoexpand: boolean, pad: number},
    font: {color: string, family: string, size: number},
    paper_bgcolor: string
}

export interface IHeaderStyle {
    align: string,
    fill: { color: string },
    font: { family: string, size: number, color: string },
}

export interface ICellStyle {
    align: string[],
    line: { color: string, width: number }
}

export interface Iconfig {
    displaylogo: boolean,
    responsive: boolean,
    displayModeBar: boolean,
    tableHeaderStyle: IHeaderStyle,
    tableCellStyle: ICellStyle,
    sendData: boolean
}

export const inittail_layout: ILayout ={
    // title: "Table displaying the Titanic dataset",
    automargin: true,
    // height: 200,
    autosize: true,
    margin: {t:0,r:0,b:0,l:0, autoexpand: false, pad:0 },
    font: {color:  "black", family: 'Poppins', size: 12},
    paper_bgcolor: 'gray'
}

export const inittail_config: Iconfig = {
    displaylogo: false,
    responsive: true,
    displayModeBar: false,
    tableHeaderStyle: {
        align: "center",
        fill: { color: 'lightgrey' },
        font: { family: "Poppins", size: 10, color: "black" },    
    },
    tableCellStyle:  {
        align: ["left"],
        line: { color: "black", width: 0.1 }
    },
    sendData: false
  }