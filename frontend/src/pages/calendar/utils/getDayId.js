const getDayId = (dateStr) => {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay();
  
  switch (dayOfWeek) {
      case 0:
          return '20770718-a98e-499f-ae8b-c395f0f743bb';
      case 1:
          return '2d0599e7-2729-49ee-acbe-ede6de8ad9b7';
      case 2:
          return '3260c7e7-c57b-4144-803f-7db9cf88393c';
      case 3:
          return '56cbe76a-0cf6-4647-8a49-2ef9fd102079';
      case 4:
          return '6d92706c-9bb1-447e-bf74-572609066663';
      case 5:
          return 'ecd70b60-3fef-4d43-9181-2f9db60e19fe';
      case 6:
          return 'fa2adb44-e5ba-4586-ae19-5f1e1767228d';
      default:
          return null; // Just in case
  }
}
export default getDayId