const getIntersectionArray = (arr1, arr2) => {
  return arr1 ? arr1.filter((e) => arr2.includes(e)) : [];
};

const checkIntersectionArray = (arr1, arr2) => {
    return arr1.some((item) => arr2.includes(item));
  };


module.exports = {
    getIntersectionArray,
    checkIntersectionArray
}
