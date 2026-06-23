import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Tienda from './components/Tienda';
import DashboardAdmin from './components/DashboardAdmin';
import DashboardCliente from './components/DashboardCliente';
import DashboardRepartidor from './components/DashboardRepartidor';
import './index.css';

export default function App() {
  const [usuario, setUsuario] = useState(JSON.parse(localStorage.getItem('usuario')));
  const [vista, setVista] = useState('tienda');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  const [authModal, setAuthModal] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [authError, setAuthError] = useState('');
  
  const [loginForm, setLoginForm] = useState({ Usuario: '', Password: '' });
  const [regForm, setRegForm] = useState({ Usuario: '', Password: '', NombreCompleto: '', Calle: '', Numero: '', Colonia: '', Municipio: '', CodigoPostal: '', Telefono: '' });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const cerrarSesion = () => {
    localStorage.removeItem('usuario');
    setUsuario(null);
    setVista('tienda');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/login', loginForm);
      localStorage.setItem('usuario', JSON.stringify(res.data));
      setUsuario(res.data);
      setAuthModal(false);
      setAuthError('');
    } catch (err) { setAuthError('Credenciales incorrectas'); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/register', regForm);
      alert('Registro exitoso. Ahora puedes iniciar sesión.');
      setIsRegister(false);
      setAuthError('');
    } catch (err) { setAuthError('Error en el registro o el usuario ya existe.'); }
  };

  return (
    <div className="container">
      <nav className="navbar">
        <div className="navbar-brand"><h2>MossoTienda</h2></div>

        <div className="navbar-center">
          <button className={vista === 'tienda' ? 'active' : ''} onClick={() => setVista('tienda')}>
            Catálogo
          </button>

          {/* FIX: 'Empleado' cambiado a 'Almacenista' para que ese rol pueda ver su panel */}
          {usuario && (usuario.Rol === 'Administrador' || usuario.Rol === 'Almacenista') && (
            <button className={vista === 'dashboard' ? 'active' : ''} onClick={() => setVista('dashboard')}>
              Panel ({usuario.Rol})
            </button>
          )}

          {usuario && usuario.Rol === 'Repartidor' && (
            <button className={vista === 'repartidor' ? 'active' : ''} onClick={() => setVista('repartidor')}>
              Mis Rutas
            </button>
          )}

          {usuario && usuario.Rol === 'Cliente' && (
            <button className={vista === 'perfil' ? 'active' : ''} onClick={() => setVista('perfil')}>
              Mi Perfil y Pedidos
            </button>
          )}
        </div>

        <div className="navbar-right">
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {usuario ? (
            <>
              <span className="user-greeting">Hola, {usuario.NombreCompleto.split(' ')[0]}</span>
              <button className="btn-outline" onClick={cerrarSesion}>Cerrar Sesión</button>
            </>
          ) : (
            <button className="btn" style={{ width: 'auto' }} onClick={() => setAuthModal(true)}>
              Iniciar Sesión
            </button>
          )}
        </div>
      </nav>

      {/* FIX: 'Empleado' cambiado a 'Almacenista' en el render también */}
      {vista === 'tienda'      && <Tienda usuario={usuario} setUsuario={setUsuario} openLogin={() => { setAuthModal(true); setIsRegister(false); }} />}
      {vista === 'dashboard'   && usuario && (usuario.Rol === 'Administrador' || usuario.Rol === 'Almacenista') && <DashboardAdmin usuario={usuario} />}
      {vista === 'perfil'      && usuario && usuario.Rol === 'Cliente'     && <DashboardCliente   usuario={usuario} />}
      {vista === 'repartidor'  && usuario && usuario.Rol === 'Repartidor'  && <DashboardRepartidor usuario={usuario} />}

      {/* ── MODAL LOGIN / REGISTRO ── */}
      {authModal && (
        <div className="modal-overlay">
          <div className="modal-body">
            <button className="modal-close" onClick={() => setAuthModal(false)}>✕</button>
            {authError && <p style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>{authError}</p>}

            {!isRegister ? (
              <form onSubmit={handleLogin}>
                <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Bienvenido</h2>
                <input
                  placeholder="Usuario"
                  value={loginForm.Usuario}
                  onChange={e => setLoginForm({ ...loginForm, Usuario: e.target.value })}
                  style={{ marginBottom: '15px' }}
                  required
                />
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={loginForm.Password}
                  onChange={e => setLoginForm({ ...loginForm, Password: e.target.value })}
                  style={{ marginBottom: '20px' }}
                  required
                />
                <button type="submit" className="btn" style={{ marginBottom: '15px' }}>Entrar</button>
                <p style={{ textAlign: 'center', fontSize: '0.9rem' }}>
                  ¿No tienes cuenta?{' '}
                  <span
                    style={{ color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 'bold' }}
                    onClick={() => setIsRegister(true)}
                  >
                    Regístrate aquí
                  </span>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister} style={{ maxHeight: '80vh', overflowY: 'auto', paddingRight: '10px' }}>
                <h3 style={{ marginBottom: '15px' }}>Nuevo Registro</h3>
                <input
                  placeholder="Usuario (Login)"
                  value={regForm.Usuario}
                  onChange={e => setRegForm({ ...regForm, Usuario: e.target.value })}
                  style={{ marginBottom: '10px' }}
                  required
                />
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={regForm.Password}
                  onChange={e => setRegForm({ ...regForm, Password: e.target.value })}
                  style={{ marginBottom: '10px' }}
                  required
                />
                <input
                  placeholder="Nombre Completo"
                  value={regForm.NombreCompleto}
                  onChange={e => setRegForm({ ...regForm, NombreCompleto: e.target.value })}
                  style={{ marginBottom: '15px' }}
                  required
                />

                <h4 style={{ marginBottom: '10px' }}>Dirección de Envío</h4>
                <div className="flex-row" style={{ marginBottom: '10px' }}>
                  <input placeholder="Calle"   value={regForm.Calle}   onChange={e => setRegForm({ ...regForm, Calle: e.target.value })}   required />
                  <input placeholder="Número"  value={regForm.Numero}  onChange={e => setRegForm({ ...regForm, Numero: e.target.value })}  required />
                </div>
                <div className="flex-row" style={{ marginBottom: '10px' }}>
                  <input placeholder="Colonia"    value={regForm.Colonia}    onChange={e => setRegForm({ ...regForm, Colonia: e.target.value })}    required />
                  <input placeholder="Municipio"  value={regForm.Municipio}  onChange={e => setRegForm({ ...regForm, Municipio: e.target.value })}  required />
                </div>
                <div className="flex-row" style={{ marginBottom: '15px' }}>
                  <input placeholder="Código Postal"  value={regForm.CodigoPostal}  onChange={e => setRegForm({ ...regForm, CodigoPostal: e.target.value })}  required />
                  <input placeholder="Teléfono"        value={regForm.Telefono}       onChange={e => setRegForm({ ...regForm, Telefono: e.target.value })}       required />
                </div>

                <button type="submit" className="btn" style={{ marginBottom: '10px' }}>Crear Cuenta</button>
                <button type="button" className="btn-danger" style={{ width: '100%' }} onClick={() => setIsRegister(false)}>
                  Volver al Login
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}