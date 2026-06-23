import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Marker, InfoWindow } from '@react-google-maps/api';

// ⚠️ Fuera del componente para evitar recargas innecesarias
const LIBRARIES = ['places'];
const MAP_CONTAINER_STYLE = { width: '100%', height: '480px', borderRadius: '10px' };

// Origen y destino siempre fijo: ESCOM IPN
const ORIGEN_TIENDA = 'ESCOM IPN, Unidad Profesional Adolfo López Mateos, Av. Juan de Dios Bátiz, Nueva Industrial Vallejo, Gustavo A. Madero, 07320 Ciudad de México, CDMX';
const MAP_CENTER_DEFAULT = { lat: 19.5047, lng: -99.1466 };

const iconoParada = 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
const iconoTienda = 'https://maps.google.com/mapfiles/ms/icons/green-dot.png';

export default function DashboardRepartidor({ usuario }) {
  const [pedidos, setPedidos]                       = useState([]);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [rutaCalculada, setRutaCalculada]           = useState(false);
  const [cargandoRuta, setCargandoRuta]             = useState(false);
  const [paradaActiva, setParadaActiva]             = useState(0);
  const [infoAbierta, setInfoAbierta]               = useState(null);
  const [instruccionActual, setInstruccionActual]   = useState(0);
  const [paradasOrdenadas, setParadasOrdenadas]     = useState([]);
  const [entregadasIds, setEntregadasIds]           = useState(new Set());
  const [mapsUrl, setMapsUrl]                       = useState('');
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  useEffect(() => {
    fetchPedidos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario.Id]);

  const fetchPedidos = async () => {
    try {
      const res = await axios.get(`/api/pedidos/repartidor/${usuario.Id}`);
      setPedidos(res.data);
      setDirectionsResponse(null);
      setRutaCalculada(false);
      setParadasOrdenadas([]);
      setMapsUrl('');
    } catch (error) {
      console.error('Error al cargar pedidos del repartidor', error);
    }
  };

  // Construye la URL de Google Maps para abrir la app nativa con toda la ruta
  const construirMapsUrl = useCallback((paradasOpt) => {
    if (paradasOpt.length === 0) return '';
    const origen  = encodeURIComponent(ORIGEN_TIENDA);
    const destino = encodeURIComponent(ORIGEN_TIENDA); // regresa a ESCOM
    const waypoints = paradasOpt
      .map(p => encodeURIComponent(
        `${p.Calle} ${p.Numero}, ${p.Colonia}, ${p.Municipio}, ${p.CodigoPostal}, México`
      ))
      .join('|');
    return `https://www.google.com/maps/dir/?api=1&origin=${origen}&destination=${destino}&waypoints=${waypoints}&travelmode=driving`;
  }, []);

  // 1 sola llamada a Directions API al presionar el botón
  const calcularRuta = useCallback(async () => {
    if (pedidos.length === 0) return;
    setCargandoRuta(true);

    // eslint-disable-next-line no-undef
    const directionsService = new google.maps.DirectionsService();

    const waypoints = pedidos.map(p => ({
      location: `${p.Calle} ${p.Numero}, ${p.Colonia}, ${p.Municipio}, ${p.CodigoPostal}, México`,
      stopover: true,
    }));

    try {
      const resultado = await directionsService.route({
        origin:            ORIGEN_TIENDA,
        destination:       ORIGEN_TIENDA, // regresa a ESCOM al terminar
        waypoints,
        optimizeWaypoints: true,
        // eslint-disable-next-line no-undef
        travelMode:        google.maps.TravelMode.DRIVING,
        region:            'MX',
        language:          'es',
      });

      setDirectionsResponse(resultado);
      setRutaCalculada(true);
      setParadaActiva(0);
      setInstruccionActual(0);

      const ordenOptimo = resultado.routes[0].waypoint_order;
      const paradasOpt  = ordenOptimo.map((idx, i) => ({
        ...pedidos[idx],
        paradaNum: i + 1,
      }));
      setParadasOrdenadas(paradasOpt);
      setMapsUrl(construirMapsUrl(paradasOpt));
    } catch (error) {
      console.error('Error calculando ruta:', error);
      alert('No se pudo calcular la ruta. Verifica que las direcciones sean válidas.');
    } finally {
      setCargandoRuta(false);
    }
  }, [pedidos, construirMapsUrl]);

  const marcarEntregado = async (pedidoId) => {
    try {
      await axios.put(`/api/pedidos/${pedidoId}/estado`, { Estado: 'Entregado' });
      setEntregadasIds(prev => new Set([...prev, pedidoId]));
      fetchPedidos();
    } catch (error) {
      console.error(error);
    }
  };

  const onMapLoad = useCallback(map => { mapRef.current = map; }, []);

  const instruccionesTramoActivo = rutaCalculada && directionsResponse
    ? directionsResponse.routes[0].legs[paradaActiva]?.steps || []
    : [];

  if (loadError) return (
    <div className="card" style={{ color: 'var(--accent-color)', padding: '20px' }}>
      ❌ Error cargando Google Maps. Verifica tu API Key.
    </div>
  );

  if (!isLoaded) return (
    <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
      🗺️ Cargando mapa...
    </div>
  );

  const BtnMaps = () => (
    <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        backgroundColor: '#1967D2', color: 'white',
        padding: '10px 18px', borderRadius: '6px',
        fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
      </svg>
      Abrir en Google Maps
    </a>
  );

  return (
    <div className="dashboard-layout">
      <div className="dashboard-content" style={{ flex: 1 }}>

        {/* ── MAPA ── */}
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px', flexWrap:'wrap', gap:'10px' }}>
            <div>
              <h2>🗺️ Ruta de Entregas</h2>
              <small style={{ color:'var(--text-muted)' }}>📍 Origen/Destino: ESCOM IPN</small>
            </div>
            <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
              <button className="btn" onClick={calcularRuta}
                disabled={cargandoRuta || pedidos.length === 0}
                style={{ width:'auto', backgroundColor: rutaCalculada ? '#1864ab' : '#2b8a3e' }}>
                {cargandoRuta ? '⏳ Calculando...' : rutaCalculada ? '🔄 Recalcular' : '▶️ Calcular Ruta'}
              </button>
              {rutaCalculada && mapsUrl && <BtnMaps />}
            </div>
          </div>

          {pedidos.length === 0 && (
            <div style={{ textAlign:'center', padding:'20px', color:'var(--text-muted)' }}>
              ✅ No tienes entregas pendientes.
            </div>
          )}

          <GoogleMap center={MAP_CENTER_DEFAULT} zoom={13}
            mapContainerStyle={MAP_CONTAINER_STYLE} onLoad={onMapLoad}
            options={{ zoomControl:true, streetViewControl:false, mapTypeControl:false, fullscreenControl:true }}>

            {directionsResponse && (
              <DirectionsRenderer directions={directionsResponse}
                options={{ suppressMarkers:true, polylineOptions:{ strokeColor:'#2d6a4f', strokeWeight:5, strokeOpacity:0.8 } }}
              />
            )}

            {rutaCalculada && paradasOrdenadas.map((parada, idx) => {
              const leg = directionsResponse.routes[0].legs[idx];
              const pos = leg.start_location;
              return (
                <Marker key={parada.Id}
                  position={{ lat: pos.lat(), lng: pos.lng() }}
                  icon={iconoParada}
                  label={{ text: `${parada.paradaNum}`, color:'white', fontWeight:'bold' }}
                  onClick={() => { setInfoAbierta(idx); setParadaActiva(idx); setInstruccionActual(0); }}
                >
                  {infoAbierta === idx && (
                    <InfoWindow onCloseClick={() => setInfoAbierta(null)}>
                      <div style={{ maxWidth:'220px', fontSize:'0.85rem', lineHeight:1.6 }}>
                        <strong>Parada {parada.paradaNum}</strong><br />
                        👤 {parada.Cliente}<br />
                        📍 {parada.Calle} {parada.Numero}, {parada.Colonia}<br />
                        📞 {parada.TelefonoCliente}<br />
                        💵 ${Number(parada.Total).toFixed(2)}<br />
                        🕐 {leg.duration.text} · 📏 {leg.distance.text}
                      </div>
                    </InfoWindow>
                  )}
                </Marker>
              );
            })}

            {/* Marcador ESCOM */}
            {rutaCalculada && directionsResponse && (() => {
              const lastLeg = directionsResponse.routes[0].legs[directionsResponse.routes[0].legs.length - 1];
              const pos = lastLeg.end_location;
              return (
                <Marker position={{ lat: pos.lat(), lng: pos.lng() }} icon={iconoTienda}
                  onClick={() => setInfoAbierta('escom')}>
                  {infoAbierta === 'escom' && (
                    <InfoWindow onCloseClick={() => setInfoAbierta(null)}>
                      <div style={{ fontSize:'0.85rem' }}>
                        <strong>🏫 ESCOM IPN</strong><br />
                        Av. Juan de Dios Bátiz,<br />Nueva Industrial Vallejo, CDMX
                      </div>
                    </InfoWindow>
                  )}
                </Marker>
              );
            })()}
          </GoogleMap>
        </div>

        {/* ── INSTRUCCIONES PASO A PASO ── */}
        {rutaCalculada && paradasOrdenadas.length > 0 && (
          <div className="card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px', flexWrap:'wrap', gap:'8px' }}>
              <h3>🧭 Instrucciones Paso a Paso</h3>
              <select style={{ padding:'6px 12px', borderRadius:'6px', minWidth:'220px' }}
                value={paradaActiva}
                onChange={e => { setParadaActiva(Number(e.target.value)); setInstruccionActual(0); }}>
                {paradasOrdenadas.map((p, i) => (
                  <option key={p.Id} value={i}>
                    Parada {p.paradaNum}: {p.Cliente} ({directionsResponse.routes[0].legs[i].duration.text})
                  </option>
                ))}
              </select>
            </div>

            {/* Resumen del tramo */}
            {directionsResponse.routes[0].legs[paradaActiva] && (
              <div style={{ background:'var(--bg-primary)', borderRadius:'8px', padding:'12px 16px', marginBottom:'14px', display:'flex', gap:'20px', flexWrap:'wrap', fontSize:'0.9rem' }}>
                <span>📍 <strong>Destino:</strong> {paradasOrdenadas[paradaActiva]?.Calle} {paradasOrdenadas[paradaActiva]?.Numero}, {paradasOrdenadas[paradaActiva]?.Colonia}</span>
                <span>⏱️ {directionsResponse.routes[0].legs[paradaActiva].duration.text}</span>
                <span>📏 {directionsResponse.routes[0].legs[paradaActiva].distance.text}</span>
              </div>
            )}

            {/* Instrucción actual destacada */}
            {instruccionesTramoActivo.length > 0 && (
              <div style={{ background:'var(--primary-color)', color:'white', borderRadius:'10px', padding:'16px 20px', marginBottom:'14px' }}>
                <div style={{ fontSize:'0.75rem', opacity:0.8, marginBottom:'6px' }}>
                  Paso {instruccionActual + 1} de {instruccionesTramoActivo.length}
                </div>
                <div style={{ fontSize:'1.05rem', fontWeight:600, lineHeight:1.5 }}
                  dangerouslySetInnerHTML={{ __html: instruccionesTramoActivo[instruccionActual]?.instructions }}
                />
                {instruccionesTramoActivo[instruccionActual]?.distance && (
                  <div style={{ fontSize:'0.8rem', opacity:0.85, marginTop:'6px' }}>
                    📏 {instruccionesTramoActivo[instruccionActual].distance.text}
                  </div>
                )}
              </div>
            )}

            {/* Controles */}
            <div style={{ display:'flex', gap:'10px', justifyContent:'center', marginBottom:'14px' }}>
              <button className="btn" style={{ width:'auto', backgroundColor:'#495057' }}
                disabled={instruccionActual === 0}
                onClick={() => setInstruccionActual(i => Math.max(0, i - 1))}>
                ← Anterior
              </button>
              <button className="btn" style={{ width:'auto', backgroundColor:'#495057' }}
                disabled={instruccionActual >= instruccionesTramoActivo.length - 1}
                onClick={() => setInstruccionActual(i => Math.min(instruccionesTramoActivo.length - 1, i + 1))}>
                Siguiente →
              </button>
            </div>

            {/* Lista completa colapsable */}
            <details>
              <summary style={{ cursor:'pointer', color:'var(--text-muted)', fontSize:'0.9rem', padding:'6px 0' }}>
                Ver todos los pasos de este tramo
              </summary>
              <ol style={{ paddingLeft:'20px', marginTop:'10px' }}>
                {instruccionesTramoActivo.map((step, j) => (
                  <li key={j} onClick={() => setInstruccionActual(j)}
                    style={{
                      marginBottom:'8px', cursor:'pointer', padding:'6px 8px', borderRadius:'6px',
                      background: j === instruccionActual ? 'rgba(45,106,79,0.12)' : 'transparent',
                      color: j === instruccionActual ? 'var(--primary-color)' : 'var(--text-main)',
                      fontSize:'0.88rem',
                    }}
                    dangerouslySetInnerHTML={{ __html: `${step.instructions} <span style="opacity:0.6;font-size:0.8em">(${step.distance?.text || ''})</span>` }}
                  />
                ))}
              </ol>
            </details>

            {/* Botón abrir en Maps dentro del panel */}
            <div style={{ marginTop:'16px', textAlign:'center' }}>
              <BtnMaps />
            </div>
          </div>
        )}

        {/* ── TABLA DE ENTREGAS ── */}
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'18px', flexWrap:'wrap', gap:'8px' }}>
            <h3 style={{ margin:0 }}>📦 Entregas Pendientes
              {pedidos.length > 0 && (
                <span style={{ marginLeft:'10px', background:'var(--primary-color)', color:'white', borderRadius:'999px', padding:'2px 10px', fontSize:'0.8rem', fontWeight:600, verticalAlign:'middle' }}>
                  {pedidos.length}
                </span>
              )}
            </h3>
            <button className="btn" style={{ width:'auto', fontSize:'0.85rem', backgroundColor:'#495057' }} onClick={fetchPedidos}>
              🔄 Actualizar
            </button>
          </div>

          {pedidos.length === 0 ? (
            <div style={{ textAlign:'center', padding:'48px 20px', color:'var(--text-muted)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin:'0 auto 12px', display:'block', opacity:0.4 }}>
                <polyline points="20 12 20 22 4 22 4 12"/>
                <rect x="2" y="7" width="20" height="5"/>
                <path d="M12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
              </svg>
              <p style={{ fontWeight:600, marginBottom:'4px' }}>Sin entregas pendientes</p>
              <p style={{ fontSize:'0.85rem' }}>Todas las entregas están completadas ✅</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {(rutaCalculada ? paradasOrdenadas : pedidos).map((p, idx) => {
                const entregada = entregadasIds.has(p.Id);
                return (
                  <div key={p.Id}
                    onClick={() => {
                      if (rutaCalculada) {
                        setParadaActiva(idx);
                        setInstruccionActual(0);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    style={{
                      display:'flex', alignItems:'center', gap:'14px',
                      background: entregada ? 'rgba(43,138,62,0.06)' : 'var(--bg-primary)',
                      border:`1px solid ${entregada ? 'rgba(43,138,62,0.3)' : 'var(--border-color)'}`,
                      borderRadius:'10px', padding:'14px 16px',
                      cursor: rutaCalculada ? 'pointer' : 'default',
                      transition:'box-shadow 0.15s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow='none'}
                  >
                    {/* Círculo con número de parada o ID */}
                    <div style={{
                      minWidth:'40px', height:'40px', borderRadius:'50%',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontWeight:700, fontSize:'0.9rem', flexShrink:0,
                      background: entregada ? '#2b8a3e' : rutaCalculada ? 'var(--primary-color)' : '#dee2e6',
                      color: entregada || rutaCalculada ? 'white' : 'var(--text-main)',
                    }}>
                      {entregada ? '✓' : rutaCalculada ? p.paradaNum : `#${p.Id}`}
                    </div>

                    {/* Info del pedido */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
                        <span style={{ fontWeight:600, fontSize:'0.95rem' }}>{p.Cliente}</span>
                        {entregada && (
                          <span style={{ background:'rgba(43,138,62,0.15)', color:'#2b8a3e', borderRadius:'999px', padding:'1px 8px', fontSize:'0.75rem', fontWeight:600 }}>
                            Entregado
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize:'0.83rem', color:'var(--text-muted)', margin:'3px 0', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                        📍 {p.Calle} {p.Numero}, {p.Colonia}
                      </p>
                      <div style={{ display:'flex', gap:'12px', fontSize:'0.8rem', color:'var(--text-muted)', flexWrap:'wrap' }}>
                        <span>📞 {p.TelefonoCliente}</span>
                        <span>🕐 {p.HorarioEntrega}</span>
                        <span style={{ fontWeight:700, color:'var(--text-main)' }}>💵 ${Number(p.Total).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Botón entregar */}
                    <button
                      onClick={e => { e.stopPropagation(); marcarEntregado(p.Id); }}
                      disabled={entregada}
                      style={{
                        padding:'8px 14px', borderRadius:'8px', border:'none',
                        cursor: entregada ? 'default' : 'pointer',
                        background: entregada ? '#dee2e6' : '#2b8a3e',
                        color: entregada ? '#868e96' : 'white',
                        fontWeight:600, fontSize:'0.82rem',
                        whiteSpace:'nowrap', flexShrink:0,
                        transition:'background 0.15s ease',
                      }}
                    >
                      {entregada ? '✅ Listo' : 'Entregar'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}