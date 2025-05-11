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