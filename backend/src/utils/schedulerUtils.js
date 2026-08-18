const getDays = (dataValues) => {
  let arr = [];
  if (dataValues.U == 1) {
    arr.push(0);
  }
  if (dataValues.M == 1) {
    arr.push(1);
  }
  if (dataValues.T == 1) {
    arr.push(2);
  }
  if (dataValues.W == 1) {
    arr.push(3);
  }
  if (dataValues.R == 1) {
    arr.push(4);
  }
  if (dataValues.F == 1) {
    arr.push(5);
  }
  if (dataValues.S == 1) {
    arr.push(6);
  }
  return arr;
};

module.exports = {
  getDays,
}