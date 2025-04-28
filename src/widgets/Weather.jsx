import { useState, useEffect } from "react";
import WeatherWidget from "../lib/components/WeatherWidget";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../config/firebase"; // Import your Firebase Firestore instance

const Weather = () => {
  const [farmer, setFarmer] = useState({
    city: "Palapye", // Default value is an empty string
  });

  useEffect(() => {
    const fetchListing = async () => {
      const docRef = doc(db, 'farmer', 1);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const farmerData = docSnap.data();
        setFarmer(farmerData);
      }
    }

    fetchListing();
  }, []); // Add appropriate dependencies

  return (
    <WeatherWidget
      provider="openWeather"
      apiKey="4ede61be01813f6aeb42f2372a463092"
      location={farmer.city} // Use the farmer's city as the location
      tempUnit="C"
      windSpeedUnit="mps"
      lang="en"
    />
  );
};

export default Weather;
