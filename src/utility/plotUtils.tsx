import { DataFrame } from 'danfojs';

export const computeKDE = function (
    values: number[], 
    bw: number | string = 'silverman', 
    min: number, 
    max: number,
    as_probability: boolean = true,
    binCount: number = 30
  ): { x: number[], y: number[] }{
    // Sort the values for computation
    const sortedValues = [...values].sort((a, b) => a - b);
    
    // Calculate standard deviation
    const mean = sortedValues.reduce((sum, v) => sum + v, 0) / sortedValues.length;
    const variance = sortedValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / sortedValues.length;
    const stdDev = Math.sqrt(variance);
    
    // Calculate bandwidth using rule of thumb if string provided
    const bandwidth = typeof bw === 'number' ? bw : 
      (bw === 'scott' ? 
        1.06 * stdDev * Math.pow(sortedValues.length, -0.2) : 
        0.9 * stdDev * Math.pow(sortedValues.length, -0.2)); // silverman's rule
    
    // Generate evaluation points - 200 points across the range
    const points = 200;
    const step = (max - min) / (points - 1);
    const x: number[] = Array.from({length: points}, (_, i) => min + i * step);
    
    // Calculate KDE y values (unscaled)
    const y = x.map(xi => {
      return sortedValues.reduce((sum, val) => {
        const z = (xi - val) / bandwidth;
        return sum + Math.exp(-0.5 * z * z) / (bandwidth * Math.sqrt(2 * Math.PI));
      }, 0) / sortedValues.length;
    });
    
    // If not probability density, scale to match histogram height
    if (!as_probability) {
      // Create histogram to get max value
      const binCount_ = Math.min(Math.ceil(Math.sqrt(sortedValues.length)), binCount); // Common rule for bin count
      const binSize = (max - min) / binCount_;
      
      // Calculate histogram counts
      const histCounts = Array(binCount).fill(0);
      sortedValues.forEach(val => {
        const binIndex = Math.min(Math.floor((val - min) / binSize), binCount - 1);
        if (binIndex >= 0) histCounts[binIndex]++;
      });
      
      // Get max values for scaling
      const maxHistValue = Math.max(...histCounts);
      const maxKDEValue = Math.max(...y);
      
      // Apply scaling factor
      const scaleFactor = maxHistValue / maxKDEValue;
      return { x, y: y.map(val => val * scaleFactor) };
    }
    
    return { x, y };
  };


export const computePearsonCorrelation = function (dataFrame: DataFrame): Record<string, Record<string, number>>| null {
  if (!dataFrame || dataFrame.isEmpty || dataFrame.shape[0]==0 ) return null;
  const numericColumns = dataFrame.columns.filter(colName => 
      !['string', 'boolean'].includes(dataFrame[colName].dtype)
    );
    if (numericColumns.length < 2) return null;
    
    // Calculate correlation coefficients between all numeric columns
    const matrix: Record<string, Record<string, number>> = {};
    numericColumns.forEach(col1 => {matrix[col1] = {}});
    numericColumns.forEach(col1 => {
      numericColumns.forEach(col2 => {
        if (col1 === col2) {
          matrix[col1][col2] = 1; // Self-correlation is always 1
        } 
        else if (matrix[col2][col1] !== undefined) {
            matrix[col1][col2] = matrix[col2][col1]; // Use the already calculated value
            // console.log(`Correlation between 2 ${col1} and ${col2}:`, matrix[col2][col1]);
        } 
        else {
          try {
            // Get the values for both columns
            const twoColDf = dataFrame.loc({columns: [col1, col2]});
            const firstCol = twoColDf[col1].isNa();
            const secondCol = twoColDf[col2].isNa();
            const bothNotNa = firstCol.or(secondCol).values as boolean[];
            const bothNotNa2 = bothNotNa.map((v: boolean, index) => !v ? index : -1).filter((v: number) => v !== -1);
            // Filter out NaN values
            const cleandf = twoColDf.iloc({ rows: bothNotNa2 });
            // Check if we have enough data points after filtering
            if (cleandf.shape[0] < 2) {
              matrix[col1][col2] = NaN;
              // matrix[col2] = {col1: NaN};
              return;
            }
            
            const mean1 = cleandf[col1].mean();
            const mean2 = cleandf[col2].mean();
            const std1 = cleandf[col1].std();
            const std2 = cleandf[col2].std();
            
            // Avoid division by zero
            if (std1 === 0 || std2 === 0) {
              matrix[col1][col2] = NaN;
              // matrix[col2]= {col1: NaN};
              return;
            }
            
            const values1 = cleandf[col1].apply((v: number) => (v - mean1));
            const values2 = cleandf[col2].apply((v: number) => (v - mean2));
            // This line is wrong because it doesn't account for the number of data points
            // const correlation = values1.mul(values2).sum()/(std1*std2);

            // Corrected Pearson correlation formula
            const n = cleandf.shape[0];
            const correlation = values1.mul(values2).sum() / ((n-1) * std1 * std2);
            
            matrix[col1][col2] = correlation;
            // matrix[col2] = {col1: correlation};
            // console.log(`Correlation between 1 ${col1} and ${col2}:`, correlation);
          } catch (err) {
            console.log(`Error calculating correlation between ${col1} and ${col2}:`, err);
            matrix[col1][col2] = NaN;
            //matrix[col2][col1] = NaN;
          }
        }
      });
    });
    return matrix;
}
 