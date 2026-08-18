// Finds duplicated values
//const findDuplicates = (arr: string[]) =>
  //arr.filter((item: string, index: number) => arr.indexOf(item) !== index);
  const findDuplicates = (arr: string[]) => {
    const lowercasedArr = arr.map((item) => item.toLowerCase());
    return arr.filter((item, index) => lowercasedArr.indexOf(item.toLowerCase()) !== index);
  };
  
export default findDuplicates;
