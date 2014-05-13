module.exports.compare = function (a, b) {
  a = parseInt(a), b = parseInt(b);
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
};