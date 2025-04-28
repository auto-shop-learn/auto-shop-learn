import "leaflet/dist/leaflet.css"
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'

export default function Map() {
  return (
    <div className='leafletContainer'>
      <MapContainer
        style={{ height: '100%', width: '100%' }}
        center={[-22.595368, 27.114698]}
        zoom={13}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png'
        />

        {/* First Marker */}
        <Marker position={[-22.595368, 27.114698]}>
          <Popup>Farm 1 West Plot</Popup>
        </Marker>

        {/* Second Marker */}
        <Marker position={[-22.595, 27.115]}>
          <Popup>Farm 1 East Plot</Popup>
        </Marker>

        {/* Third Marker */}
        <Marker position={[-22.590, 27.115]}>
          <Popup>Farm 1 North Plot</Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
