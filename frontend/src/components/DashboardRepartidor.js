import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleMap, useJsApiLoader, DirectionsRenderer } from '@react-google-maps/api';

const mapContainerStyle = { width: '100%', height: '500px', borderRadius: '10px' };
// Coordenadas aproximadas de ESCOM IPN
const center = { lat: 19.5047, lng: -99.1466 }; 

export default function DashboardRepartidor({ usuario }) {
  const [pedidos, setPedidos] = useState([]);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [mostrandoInstrucciones, setMostrandoInstrucciones] = useState(false);
  
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY, 
  });

  useEffect(() => {
    fetchPedidos();
  }, [usuario.Id]);

  const fetchPedidos = async () => {
    try {
      const res = await axios.get(`/api/pedidos/repartidor/${usuario.Id}`);
      setPedidos(res.data);
    } catch (error) {
      console.error('Error al cargar pedidos del repartidor', error);
    }
  };

  const calcularRutaOptima = async () => {
    if (pedidos.length === 0) return;
    
    // eslint-disable-next-line no-undef
    const directionsService = new google.maps.DirectionsService();
    const origen = "ESCOM IPN, Unidad Profesional Adolfo López Mateos, Av. Juan de Dios Bátiz, Nueva Industrial Vallejo, Gustavo A. Madero, 07320 Ciudad de México, CDMX"; 
    const destino = origen; 

    const waypoints = pedidos.map(p => ({
      location: `${p.Calle} ${p.Numero}, ${p.Colonia}, ${p.Municipio}, ${p.CodigoPostal}`,
      stopover: true
    }));

    try {
      const results = await directionsService.route({
        origin: origen,
        destination: destino,
        waypoints: waypoints,
        optimizeWaypoints: true,
        // eslint-disable-next-line no-undef
        travelMode: google.maps.TravelMode.DRIVING,
      });
      setDirectionsResponse(results);
      setMostrandoInstrucciones(true);
    } catch (error) {
      console.error('Error calculando la ruta: ', error);
      alert('No se pudo calcular la ruta. Verifica que las direcciones sean válidas.');
    }
  };

  const marcarEntregado = async (pedidoId) => {
    try {
      await axios.put(`/api/pedidos/${pedidoId}/estado`, { Estado: 'Entregado' });
      fetchPedidos(); 
      setDirectionsResponse(null); 
      setMostrandoInstrucciones(false);
    } catch (error) {
      console.error(error);
    }
  };

  if (!isLoaded) return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando mapa...</div>;

  return (
    <div className="dashboard-layout">
      <div className="dashboard-content" style={{ flex: 1 }}>
        <div className="card">
          <h2 style={{ marginBottom: '15px' }}>Ruta de Entregas</h2>
          <button className="btn" onClick={calcularRutaOptima} style={{ marginBottom: '20px', backgroundColor: '#2b8a3e' }}>
            Comenzar Ruta
          </button>
          
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px' }}>
            <GoogleMap
              center={center}
              zoom={13}
              mapContainerStyle={mapContainerStyle}
              options={{ disableDefaultUI: true, zoomControl: true }}
            >
              {directionsResponse && (
                <DirectionsRenderer directions={directionsResponse} />
              )}
            </GoogleMap>
          </div>
        </div>

        {mostrandoInstrucciones && directionsResponse && (
          <div className="card" style={{ marginTop: '20px' }}>
            <h3>📋 Instrucciones de Navegación</h3>
            <ol>
              {directionsResponse.routes[0].legs.map((leg, i) => (
                <div key={i}>
                  {leg.steps.map((step, j) => (
                    <li key={j} dangerouslySetInnerHTML={{ __html: step.instructions }} style={{ marginBottom: '10px' }} />
                  ))}
                </div>
              ))}
            </ol>
          </div>
        )}

        <div className="card" style={{ marginTop: '20px' }}>
          <h3>Mis Entregas Pendientes ({pedidos.length})</h3>
          <table className="tabla" style={{ marginTop: '15px' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Dirección</th>
                <th>Total</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map(p => (
                <tr key={p.Id}>
                  <td>#{p.Id}</td>
                  <td>{p.Cliente} <br/><small>{p.TelefonoCliente}</small></td>
                  <td>{p.Calle} {p.Numero}, {p.Colonia}</td>
                  <td>${p.Total.toFixed(2)}</td>
                  <td>
                    <button className="btn-primary" onClick={() => marcarEntregado(p.Id)}>
                      Entregado
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}