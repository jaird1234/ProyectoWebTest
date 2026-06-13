import React, { useState } from 'react';
import axios from 'axios';

export default function Login() {
  const [form, setForm]     = useState({ Usuario: '', Password: '' });
  const [error, setError]   = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3001/api/login', form);
      localStorage.setItem('usuario', JSON.stringify(res.data));
      window.location.reload();
    } catch {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh' }}>
      <form onSubmit={handleSubmit} style={{ background:'white', padding:'2rem', borderRadius:'12px', width:'320px', boxShadow:'0 4px 20px rgba(0,0,0,.1)' }}>
        <h2 style={{ textAlign:'center', color:'#2d6a4f', marginBottom:'1.5rem' }}>🛒 Tienda Abarrotes</h2>
        {error && <p style={{ color:'red', marginBottom:'1rem' }}>{error}</p>}
        <input placeholder="Usuario" value={form.Usuario} onChange={e => setForm({...form, Usuario: e.target.value})}
          style={{ width:'100%', padding:'.6rem', marginBottom:'.75rem', border:'1px solid #ccc', borderRadius:'6px' }} required />
        <input type="password" placeholder="Contraseña" value={form.Password} onChange={e => setForm({...form, Password: e.target.value})}
          style={{ width:'100%', padding:'.6rem', marginBottom:'1rem', border:'1px solid #ccc', borderRadius:'6px' }} required />
        <button type="submit" style={{ width:'100%', background:'#2d6a4f', color:'white', padding:'.7rem', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'600' }}>
          Entrar
        </button>
      </form>
    </div>
  );
}