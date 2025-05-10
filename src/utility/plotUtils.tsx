export const computeKDE = function (
    values: number[], 
    bw: number | string = 'silverman', 
    min: number, 
    max: number
  ): { x: number[], y: number[] }{
    // Sort the values for computation
    const sortedValues = [...values].sort((a, b) => a - b);
    
    // Calculate standard deviation
    const mean = sortedValues.reduce((sum, v) => sum + v, 0) / sortedValues.length;
    const variance = sortedValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / sortedValues.length;
    const stdDev = Math.sqrt(variance);
    
    // Calculate bandwidth using rule of thumb if string provided
    const  bandwidth = typeof bw === 'number' ? bw : 
      (bw === 'scott' ? 
        1.06 * stdDev * Math.pow(sortedValues.length, -0.2) : 
        0.9 * stdDev * Math.pow(sortedValues.length, -0.2)); // silverman's rule
    
    // Generate evaluation points - 200 points across the range
    const points = 200;
    const step = (max - min) / (points - 1);
    const x: number[] = Array.from({length: points}, (_, i) => min + i * step);
    
    // Compute KDE values at each point
    const y = x.map(xi => {
      return sortedValues.reduce((sum, val) => {
        // Gaussian kernel
        const z = (xi - val) / bandwidth;
        return sum + Math.exp(-0.5 * z * z);
      }, 0) / (sortedValues.length * bandwidth * Math.sqrt(2 * Math.PI));
    });
    
    return { x, y };
  };