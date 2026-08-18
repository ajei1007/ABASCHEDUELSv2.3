import { MOBILE_DEVICE_WIDTH } from 'constants/devices';
// import { useLayoutEffect, useState } from 'react';

const useIsMobile = () => {
  // const [width, setWidth] = useState(window.innerWidth);
  // const handleWindowSizeChange = () => {
  //   setWidth(window.innerWidth);
  // };

  // useLayoutEffect(() => {
  //   window.addEventListener('resize', handleWindowSizeChange);
  //   return () => {
  //     window.removeEventListener('resize', handleWindowSizeChange);
  //   };
  // }, []);

  return window.innerWidth <= MOBILE_DEVICE_WIDTH;
};

export default useIsMobile;
