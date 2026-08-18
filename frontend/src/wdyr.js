import React from 'react';

// const customNotifier = ({ componentName, reason, actualDuration }) => {
//   // console.log('reason', reason)
//   console.log(`Component ${componentName} re-rendered due to ${reason.type}`);
//   if (reason.type === 'props') {
//     console.log('Changed props:', reason.propsDiff);
//   }
//   if (reason.type === 'state') {
//     console.log('Changed state:', reason.stateDiff);
//   }
// };

if (import.meta.env.DEV) {
  // const whyDidYouRender = require('@welldone-software/why-did-you-render');
  // whyDidYouRender(React, {
  //   trackAllPureComponents: true,
  //   logOnDifferentValues: true,
  //   logOwnerReasons: true
  //   notifier: customNotifier,
  // });
}