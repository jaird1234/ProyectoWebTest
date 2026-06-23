import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Articulos() {
  const [articulos, setArticulos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState({ Nombre: '', Precio: '', Stock: '', CategoriaId: '' });
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const resArt = await axios.get('http://localhost:3001/api/articulos');
    const resCat = await axios.get('http://localhost:3001/api/categorias');
    setArticulos(resArt.data);
    setCategorias(resCat.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editando) {
      await axios.put(`http://localhost:3001/api/articulos/${editando}`, form);
    } else {
      await axios.post('http://localhost:3001/api/articulos', form);
    }
    setForm({ Nombre: '', Precio: '', Stock: '', CategoriaId: '', Imagen: '' });
    setEditando(null);
    cargarDatos();
  };

  const editar = (item) => {
  setForm({ Nombre: item.Nombre, Precio: item.Precio, Stock: item.Stock, CategoriaId: item.CategoriaId, Imagen: item.Imagen || '' });
  setEditando(item.Id);
};

  const eliminar = async (id) => {
    if(window.confirm('¿Seguro que deseas eliminar este artículo?')) {
      await axios.delete(`http://localhost:3001/api/articulos/${id}`);
      cargarDatos();
    }
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '15px' }}>{editando ? "✏️ Editar Artículo" : "📦 Registrar Artículo"}</h2>
<form onSubmit={handleSubmit} className="form-group">
        <div className="flex-row">
          <input placeholder="Nombre del producto" value={form.Nombre} onChange={e => setForm({...form, Nombre: e.target.value})} required />
          <input type="number" step="0.01" placeholder="Precio ($)" value={form.Precio} onChange={e => setForm({...form, Precio: e.target.value})} required />
        </div>
        <div className="flex-row">
          <input type="number" placeholder="Cantidad en Stock" value={form.Stock} onChange={e => setForm({...form, Stock: e.target.value})} required />
          <select value={form.CategoriaId} onChange={e => setForm({...form, CategoriaId: e.target.value})} required>
            <option value="">Selecciona una Categoría...</option>
            {categorias.map(c => <option key={c.Id} value={c.Id}>{c.Nombre}</option>)}
          </select>
        </div>
        
        {/* AQUÍ ES DONDE SE AÑADE EL CAMPO DE LA IMAGEN */}
        <div className="flex-row">
          <input placeholder="URL de la imagen (Ej: https://...)" value={form.Imagen} onChange={e => setForm({...form, Imagen: e.target.value})} />
        </div>

        <button type="submit" className="btn">{editando ? "Actualizar Artículo" : "Guardar Artículo"}</button>
      </form>

      <h2>Catálogo de Inventario</h2>
      <div className="grid">
        {articulos.map(a => (
          <div key={a.Id} className="item-card">
            <h3 style={{ color: '#2d6a4f' }}>{a.Nombre}</h3>
            <p><strong>Precio:</strong> ${a.Precio}</p>
            <p><strong>Stock:</strong> {a.Stock} uds.</p>
            <p style={{ fontSize: '0.9rem', color: 'gray' }}>Categoría: {a.CategoriaNombre}</p>
            <div className="flex-row" style={{ marginTop: '15px' }}>
              <button className="btn-edit" onClick={() => editar(a)}>Editar</button>
              <button className="btn-danger" onClick={() => eliminar(a.Id)}>Borrar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}