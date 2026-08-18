const VERSION_URL = '/meta.json'; // URL to fetch the version

async function checkVersion() {
  try {
    const response = await fetch(VERSION_URL);
    const serverVersion = await response.json();
    const currentVersion = localStorage.getItem('version');

    console.log(`Checking the version..., currentVersion: ${currentVersion}, updatedVersion, ${serverVersion.version}`)
    if (!currentVersion || serverVersion.version !== currentVersion) {
      localStorage.setItem('version', serverVersion.version);

      console.log('Need to update!')
      window.location.href = '/admin/scheduler';
    }
  } catch (error) {
    console.error('Error checking version:', error);
  }
}

export default checkVersion;