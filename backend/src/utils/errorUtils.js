const getCleanedStack = (err) => {
  return err.stack.split('\n').slice(0, 2).join('\n');
}

module.exports = {
  getCleanedStack
}
