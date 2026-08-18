import Geocode from "react-geocode";

export const useGeolocation = () => {
  Geocode.setApiKey("AIzaSyBjEMIgk3BXY50HiOvlUhEG17q7LBXgKjA");
  Geocode.setLanguage("en");
  Geocode.setLocationType("ROOFTOP");
  // Geocode.enableDebug();

  const getLatLonFromAddress = (address: string) => {
    // Get latitude & longitude from address.
    return Geocode.fromAddress(address).then(
      (response) => {
        const { lat, lng } = response.results[0].geometry.location;
        return { lat, lng };
      },
      (error) => {
        console.error(error);
        return null
      }
    );
  }

  return {
    getLatLonFromAddress,
  }
}