// app/utils/formatters.js

export const formatEuro = (value) => {
  const n = parseFloat(value);
  if (isNaN(n)) return "";
  return n
    .toFixed(2)
    .replace(".", ",")
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const formatDate = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString("it-IT");
};
