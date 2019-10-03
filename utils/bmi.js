module.exports = bmi = (weightInKg, heightInMetres) => {
  return (weightInKg / (heightInMetres * heightInMetres)).toFixed(2);
};
