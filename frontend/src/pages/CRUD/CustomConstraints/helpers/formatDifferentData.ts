export const getArrayOfArray = (existingArray: any, incomingArray: any, name: string) => {
  let arrayOfArray = [];
  for (const outerObj of incomingArray) {
    const outerArr = outerObj[name];
    let formattedArr = [];
    for (const innerObj of outerArr) {
      const findObj = existingArray.find((data: any) => data.value === innerObj.id);
      if (findObj) {
        formattedArr.push(findObj);
      }
    }
    arrayOfArray.push(formattedArr);
  }
  return arrayOfArray;
}

export const getArray = (existingArray: any, incomingArray: any) => {
  let updatedArr = [];
  for (const obj of incomingArray) {
    const findObj = existingArray.find((data: any) => data.value === obj.id);
    if (findObj) {
      updatedArr.push(findObj);
    }
  }
  return updatedArr;
}

export const getObject = (existingArray: any, str: any) => {
  return existingArray.find((data: any) => data.value === str) || null;
}

export const getSelectedBranches = (branches: any, incomingBranches: any) => {
  const flatMappedBranches = Object.values(branches)
  .flatMap((t: any) => t.options)
  .filter(option => option !== undefined);

  if (flatMappedBranches && flatMappedBranches.length) {
    const selectedBranches = incomingBranches.map((branch: any) => {
      console.log('flipper',flatMappedBranches);
      
      const findBranch = flatMappedBranches.find(
        (b: any) => b.id === branch.id,
      );
      return findBranch;
    });
    return selectedBranches;
  }
  return [];
};