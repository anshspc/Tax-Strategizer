export const formatCurrency = (value) => {
  if (!value || isNaN(value)) return '0.00';
  
  const absVal = Math.abs(value);
  if (absVal > 0 && absVal < 0.01) {
    if (absVal < 0.000001) return value > 0 ? '< 0.000001' : '> -0.000001';
    return value.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 });
  }
  
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const formatCrypto = (value) => {
  if (!value || isNaN(value)) return '0.0000';
  
  const absVal = Math.abs(value);
  if (absVal > 0 && absVal < 0.0001) {
    if (absVal < 0.000001) return '< 0.000001';
    return value.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 8 });
  }
  
  return value.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
};
