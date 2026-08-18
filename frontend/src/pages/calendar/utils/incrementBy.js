const incrementBy = (
  limit,
  initial = 0,
  sumBy = 1,
  prefixLabel = '',
  postFixLabel = '',
) => {
  let list = [];
  for (let i = initial; i < limit; i = i + sumBy) {
    list.push({ value: i, label: `${prefixLabel}${i}${postFixLabel}` });
  }
  return list;
};

export default incrementBy;