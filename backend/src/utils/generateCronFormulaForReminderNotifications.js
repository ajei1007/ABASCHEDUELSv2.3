const generateCronFormulaForReminderNotifications = (minuteBefore) => {
  let cronFormula = '';
  let executedMinutes = new Array();
  for (let i = 0; i < 4; i++) {
    let minute = 15 * i - minuteBefore;
    if (minute < 0) {
      minute = minute + 60;
    }
    executedMinutes.push(minute);
  }
  executedMinutes.sort((a, b) => a - b);

  for (let i = 0; i < 4; i++) {
    cronFormula = cronFormula + executedMinutes[i].toString();
    if (i < 3) {
      cronFormula = cronFormula + ',';
    }
  }

  cronFormula = cronFormula + ' * * * *';

  return cronFormula;
};

module.exports = generateCronFormulaForReminderNotifications;
