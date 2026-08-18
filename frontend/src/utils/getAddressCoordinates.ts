import { geocodeByAddress, getLatLng } from 'react-google-places-autocomplete';

export const getAddressCoordinates = async (address: string) => {
  if (!address) {
    return {
      longitude: null,
      latitude: null,
    };
  }

  try {
    const results = await geocodeByAddress(address);
    const { lat, lng } = await getLatLng(results[0]);
    return {
      longitude: lng,
      latitude: lat,
    };
  } catch (error: any) {
    console.error(error);
    return {
      longitude: null,
      latitude: null,
    };
  }
};
