const formatCustomConstraints = (customConstraints) => {
  let soft = [];
  let high = [];
  let disabled = [];
  let hard = [];
  if (customConstraints) {
    soft = customConstraints
      .filter((c) => c.soft)
      .filter((c) => c.flagging && c.solutionGenerator && c.optimizer)
      .map((item) => item.constraintId);
    high = customConstraints
      .filter((c) => !c.soft)
      .filter((c) => c.flagging && c.solutionGenerator && c.optimizer)
      .map((item) => item.constraintId);
  }
  return {
    soft,
    high,
    disabled,
    hard,
  };
};

export default formatCustomConstraints;
