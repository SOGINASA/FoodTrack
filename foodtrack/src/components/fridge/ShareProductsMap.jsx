import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Исправление иконок Leaflet для React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Кастомные иконки для пользователей
const createUserIcon = (isCurrentUser = false) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: ${isCurrentUser ? '#10b981' : '#3b82f6'};
        border: 3px solid white;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
};

const ShareProductsMap = ({ userLocation, nearbyUsers, onSelectUser }) => {
  const [map, setMap] = useState(null);

  // Радиус в метрах (1 км)
  const RADIUS = 1000;

  useEffect(() => {
    if (map && userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 14);
    }
  }, [map, userLocation]);

  if (!userLocation) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-600">Определяем ваше местоположение...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 rounded-2xl overflow-hidden border-2 border-gray-200">
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        ref={setMap}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Круг радиуса 1 км вокруг текущего пользователя */}
        <Circle
          center={[userLocation.lat, userLocation.lng]}
          radius={RADIUS}
          pathOptions={{
            color: '#10b981',
            fillColor: '#10b981',
            fillOpacity: 0.1,
            weight: 2,
          }}
        />

        {/* Маркер текущего пользователя */}
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={createUserIcon(true)}
        >
          <Popup>
            <div className="text-center">
              <p className="font-bold">Вы здесь</p>
            </div>
          </Popup>
        </Marker>

        {/* Маркеры близлежащих пользователей */}
        {nearbyUsers.map((user) => (
          <Marker
            key={user.id}
            position={[user.location.lat, user.location.lng]}
            icon={createUserIcon(false)}
            eventHandlers={{
              click: () => onSelectUser(user),
            }}
          >
            <Popup>
              <div className="text-center">
                <p className="font-bold">{user.name}</p>
                <p className="text-sm text-gray-600">
                  ~{Math.round(user.distance)}м от вас
                </p>
                <button
                  onClick={() => onSelectUser(user)}
                  className="mt-2 px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                >
                  Поделиться продуктами
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ShareProductsMap;
