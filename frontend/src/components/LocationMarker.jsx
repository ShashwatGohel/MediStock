import { useState, useRef, useMemo } from 'react';
import { Marker, Popup, useMapEvents } from 'react-leaflet';
import { userIcon } from '../utils/MapMarkerIcons';
import { getAddressFromCoords } from '../utils/locationUtils';

const LocationMarker = ({ setUserLocation, setUserAddress }) => {
    const [position, setPosition] = useState(null);
    const markerRef = useRef(null);

    const map = useMapEvents({
        click(e) {
            const newPos = e.latlng;
            setPosition(newPos);
            setUserLocation({ latitude: newPos.lat, longitude: newPos.lng });

            // Reverse geocode
            getAddressFromCoords(newPos.lat, newPos.lng).then(addr => {
                if (setUserAddress) setUserAddress(addr);
            });

            map.flyTo(newPos, map.getZoom());
        },
    });

    return position === null ? null : (
        <Marker position={position} icon={userIcon} ref={markerRef}>
            <Popup>You selected this location</Popup>
        </Marker>
    );
};

export default LocationMarker;
