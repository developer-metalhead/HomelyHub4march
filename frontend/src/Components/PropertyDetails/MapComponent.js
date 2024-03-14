import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Import marker icon images
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";

// Delete the default icon URL method
delete L.Icon.Default.prototype._getIconUrl;

// Merge new options for the default icon
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl: iconShadow,
});

const MapComponent = ({ address }) => {
  const city = `${address.city}, ${address.state}, ${address.pincode}`;
  const [coordinates, setCoordinates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCoordinates = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${city}`
        );

        const data = await response.json();

        if (isMounted) {
          if (data.length > 0) {
            const { lat, lon } = data[0];
            setCoordinates([lat, lon]);
            setLoading(false);
          } else {
            setCoordinates([]);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching geocoding data:", error);
          setError("Error fetching coordinates");
        }
      }
    };

    fetchCoordinates();

    return () => {
      isMounted = false;
    };
  }, [city]);

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {coordinates.length > 0 && (
        <MapContainer
          center={coordinates}
          zoom={coordinates.length > 0 ? 13 : 1}
          style={{ height: "320px", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {coordinates.length > 0 && (
            <Marker position={coordinates}>
              <Popup>{city}</Popup>
            </Marker>
          )}
        </MapContainer>
      )}
    </div>
  );
};

export default MapComponent;
