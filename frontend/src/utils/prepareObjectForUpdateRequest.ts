export const prepareObjectForUpdate = (ev: any) => {
  let formattedObject: any = {};
  for (const key in ev) {
    const element = ev[key];
    if (Array.isArray(element)) {
      if (element.length) {
        const arr = element.map((el) => el.id);
        formattedObject[key] = arr;
      } else {
        formattedObject[key] = [];
      }
    } else {
      formattedObject[key] = element;
    }
  }
  return formattedObject;
};
