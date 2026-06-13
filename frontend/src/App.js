import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Articulos from './components/Articulos';
import Ventas    from './components/Ventas';
import Login     from './components/Login';
import './App.css';

function App() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

  if (!usuario) return <Login />;

  return (
    <Router>
      <header className="navbar">
        <h1>🛒 Tienda de Abarrotes</h1>
        <nav>
          <NavLink to="/">Inventario</NavLink>
          <NavLink to="/ventas">Ventas</NavLink>
          <button onClick={() => { localStorage.removeItem('usuario'); window.location.reload(); }}>
            Cerrar sesión
          </button>
        </nav>
      </header>
      <main className="container">
        <Routes>
          <Route path="/"       element={<Articulos />} />
          <Route path="/ventas" element={<Ventas />} />
        </Routes>
      </main>
    </Router>
  );
}
export default App;