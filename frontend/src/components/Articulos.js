import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API   = 'http://localhost:3001/api/articulos';
const APIC  = 'http://localhost:3001/api/categorias';
const EMPTY = { Nombre:'', Precio:'', Stock:'', CategoriaId:'' };

export default function Articulos() {
  const [articulos,   setArticulos]   = useState([]);
  const [categorias,  setCategorias]  = useState([]);
  const [form, setForm]               = useState(EMPTY);
  const [editId, setEditId]           = useState(null);
  const [msg, setMsg]                 = useState('');

  useEffect(() => {
    fetchArticulos();
    axios.get(APIC).then(r => setCategorias(r.data));
  }, []);

  const fetchArticulos = () => axios.get(API).then(r => setArticulos(r.data));
  const handleChange   = e  => setForm({ ...form, [e.target.name]: e.target.value });
  const mostrarMsg     = m  => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const handleSubmit = async e => {
    e.preventDefault();
    if (editId) { await axios.put(`${API}/${editId}`, form); mostrarMsg('✅ Artículo actualizado'); setEditId(null); }
    else        { await axios.post(API, form);               mostrarMsg('✅ Artículo agregado'); }
    setForm(EMPTY);
    fetchArticulos();
  };

  const handleDelete = async id => {
    if (!window.confirm('¿Eliminar artículo?')) return;
    await axios.delete(`${API}/${id}`);
    mostrarMsg('🗑️ Eliminado');
    fetchArticulos();
  };

  return (
    <div>
      <h2 className="section-title">Inventario de Artículos</h2>
      {msg && <p className="msg">{msg}</p>}
      <form className="form-card" onSubmit={handleSubmit}>
        <h3>{editId ? 'Editar Artículo' : 'Nuevo Artículo'}</h3>
        <div className="form-grid">
          <input name="Nombre"   placeholder="Nombre"   value={form.Nombre}   onChange={handleChange} required />
          <select name="CategoriaId" value={form.CategoriaId} onChange={handleChange}>
            <option value="">-- Categoría --</option>
            {categorias.map(c => <option key={c.Id} value={c.Id}>{c.Nombre}</option>)}
          </select>
          <input name="Precio" type="number" step="0.01" placeholder="Precio" value={form.Precio} onChange={handleChange} required />
          <input name="Stock"  type="number" placeholder="Stock"  value={form.Stock}  onChange={handleChange} required />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-primary">{editId ? 'Actualizar' : 'Agregar'}</button>
          {editId && <button type="button" className="btn-secondary" onClick={() => { setEditId(null); setForm(EMPTY); }}>Cancelar</button>}
        </div>
      </form>

      <table className="tabla">
        <thead><tr><th>ID</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr></thead>
        <tbody>
          {articulos.map(a => (
            <tr key={a.Id}>
              <td>{a.Id}</td>
              <td>{a.Nombre}</td>
              <td><span className="badge">{a.CategoriaNombre || '—'}</span></td>
              <td>${Number(a.Precio).toFixed(2)}</td>
              <td className={a.Stock < 10 ? 'stock-bajo' : ''}>{a.Stock}</td>
              <td>
                <button className="btn-edit"   onClick={() => { setForm(a); setEditId(a.Id); }}>✏️</button>
                <button className="btn-delete" onClick={() => handleDelete(a.Id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}