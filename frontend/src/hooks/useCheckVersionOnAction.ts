import { useEffect, useState } from 'react';

// Custom hook to check version on specific actions
const useVersionCheckOnAction = () => {
  const [isUpdateAvailable, setisUpdateAvailable] = useState(false);
  useEffect(() => {
    // Function to perform the version check
    const checkVersionAndUpdate = async () => {
      try {
        const response = await fetch('/meta.json');
        const { version: currentVersion } = await response.json();
        const localVersion = localStorage.getItem('appVersion');

        console.log('localVersion', localVersion)
        console.log('currentVersion', currentVersion)
        if (localVersion && localVersion !== currentVersion) {
          setisUpdateAvailable(true);
        }
        localStorage.setItem('appVersion', currentVersion);
      } catch (error) {
        console.error('Failed to check for updates:', error);
      }
    };

    // Define a function to handle user actions
    const handleUserAction = () => {
      checkVersionAndUpdate();
    };

    // Add event listeners for user actions
    document.addEventListener('click', handleUserAction);
    document.addEventListener('keypress', handleUserAction);

    // Cleanup event listeners on component unmount
    return () => {
      document.removeEventListener('click', handleUserAction);
      document.removeEventListener('keypress', handleUserAction);
    };
  }, []);
  return isUpdateAvailable;
}

export default useVersionCheckOnAction;