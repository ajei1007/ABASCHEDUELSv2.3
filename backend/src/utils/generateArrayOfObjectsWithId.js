const { v4: uuidv4 } = require('uuid');

const generateArrayOfObjectsWithId = (arrayOffArrays, isNestedArray = true) => {
  if (isNestedArray) {
    return arrayOffArrays.flatMap(outerArr => {
      const innerArr = outerArr.map(obj => ({ ...obj, uuid: uuidv4() }))
      return innerArr;
    })
  }
  return arrayOffArrays.map(obj => ({ ...obj, uuid: uuidv4() }))
}

module.exports = generateArrayOfObjectsWithId;