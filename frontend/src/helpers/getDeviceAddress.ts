
const getDeviceAddress = async () => {
  // Fetch IP address
  const res = await fetch('https://api.ipify.org/?format=json', {
    method: 'GET',
  });
  const data = await res.json();
  if (data.ip) {
    return data.ip;
  }
  return '';
}

export default getDeviceAddress;