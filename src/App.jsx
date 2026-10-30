import React, { useState, useEffect } from 'react';
import { Lock, LogOut, Settings, X, Plus, Trash2, Edit3, Save, Power } from 'lucide-react';
import { supabase } from './supabase';

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Estados del Menú y Productos
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpenLocal, setIsOpenLocal] = useState(true);

  // Estados para formulario de agregar/editar
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('Empanadas');
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState('');

  // Cargar productos al iniciar
  useEffect(() => {
    fetchProducts();
    const adminActive = localStorage.getItem('alpaso_admin_active');
    if (adminActive === 'true') {
      setIsAdmin(true);
    }
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('id', { ascending: true });
    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  };

  // Validación de PIN
  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin === '2026') {
      setIsAdmin(true);
      localStorage.setItem('alpaso_admin_active', 'true');
      setIsPinModalOpen(false);
      setPin('');
      setPinError('');
    } else {
      setPinError('PIN incorrecto');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('alpaso_admin_active');
    setIsAdmin(false);
  };

  // Funciones de Administrador
  const toggleAvailable = async (id, currentStatus) => {
    const { error } = await supabase.from('products').update({ available: !currentStatus }).eq('id', id);
    if (!error) {
      setProducts(products.map(p => p.id === id ? { ...p, available: !p.available } : p));
    }
  };

  const savePrice = async (id) => {
    const { error } = await supabase.from('products').update({ price: parseFloat(editPrice) }).eq('id', id);
    if (!error) {
      setProducts(products.map(p => p.id === id ? { ...p, price: parseFloat(editPrice) } : p));
      setEditingId(null);
    }
  };

  const deleteProduct = async (id) => {
    if (confirm('¿Eliminar producto?')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) {
        setProducts(products.filter(p => p.id !== id));
      }
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newTitle || !newPrice) return;
    const { data, error } = await supabase.from('products').insert([
      { title: newTitle, price: parseFloat(newPrice), category: newCategory, available: true }
    ]).select();

    if (!error && data) {
      setProducts([...products, data[0]]);
      setNewTitle('');
      setNewPrice('');
      setShowAddForm(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e8edd6] text-[#1d2e1b] font-sans flex flex-col">
      {/* BARRA SUPERIOR (HEADER) */}
      <header className="bg-[#1d2e1b] text-[#95c623] px-5 py-4 flex justify-between items-center shadow-md">
        <div>
          <h1 className="text-xl font-black tracking-wider">AL PASO</h1>
          <p className="text-[10px] text-gray-300 font-medium">Empanadería & Sandwichería</p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-[#95c623] text-[#1d2e1b] px-3 py-1.5 rounded-xl font-extrabold text-xs active:scale-95 transition-all"
            >
              <LogOut size={14} />
              <span>Salir de Admin</span>
            </button>
          ) : (
            <button
              onClick={() => setIsPinModalOpen(true)}
              className="p-2.5 rounded-full text-[#95c623] hover:bg-white/10 active:scale-95 transition-all"
              title="Acceso Dueño"
            >
              <Lock size={20} />
            </button>
          )}
        </div>
      </header>

      {/* BANNER DE MODO ADMINISTRADOR */}
      {isAdmin && (
        <div className="bg-[#95c623] text-[#1d2e1b] px-4 py-2 text-center text-xs font-black uppercase tracking-wider shadow-inner">
          Modo Administrador Activo — Editando Menú
        </div>
      )}

      {/* CONTENIDO PRINCIPAL / CATÁLOGO */}
      <main className="p-4 max-w-lg mx-auto w-full flex-1">
        
        {/* PANEL DE CONTROL EXCLUSIVO SI ES ADMIN */}
        {isAdmin && (
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#1d2e1b]/10 mb-6 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="font-extrabold text-sm flex items-center gap-1.5">
                <Settings size={16} /> Estado del Local
              </span>
              <button
                onClick={() => setIsOpenLocal(!isOpenLocal)}
                className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 ${
                  isOpenLocal ? 'bg-[#95c623] text-[#1d2e1b]' : 'bg-red-500 text-white'
                }`}
              >
                <Power size={12} />
                {isOpenLocal ? 'ABIERTO' : 'CERRADO'}
              </button>
            </div>

            <div className="flex justify-between items-center pt-1">
              <span className="font-bold text-xs">Gestión de Productos</span>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-[#1d2e1b] text-[#95c623] px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <Plus size={14} /> Nuevo
              </button>
            </div>

            {/* Formulario Agregar Producto */}
            {showAddForm && (
              <form onSubmit={handleAddProduct} className="bg-gray-50 p-3 rounded-xl border space-y-2">
                <input
                  type="text"
                  placeholder="Nombre del producto"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2 border rounded-lg text-xs"
                  required
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Precio"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-1/2 p-2 border rounded-lg text-xs"
                    required
                  />
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-1/2 p-2 border rounded-lg text-xs"
                  >
                    <option value="Empanadas">Empanadas</option>
                    <option value="Sandwiches">Sandwiches</option>
                    <option value="Bebidas">Bebidas</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-[#95c623] text-[#1d2e1b] py-1.5 rounded-lg font-bold text-xs">
                  Guardar
                </button>
              </form>
            )}
          </div>
        )}

        {/* LISTA DE PRODUCTOS (VISTA CLIENTE Y EDITABLE SI ES ADMIN) */}
        <h2 className="font-extrabold text-base mb-3 text-[#1d2e1b]">Nuestro Menú</h2>

        {loading ? (
          <p className="text-center text-xs text-gray-500 py-6">Cargando menú...</p>
        ) : products.length === 0 ? (
          <div className="bg-white/80 p-6 rounded-2xl text-center border border-[#1d2e1b]/10">
            <p className="text-xs text-gray-500">No hay productos disponibles por el momento.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {products.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 bg-white rounded-2xl border flex items-center justify-between gap-3 shadow-sm ${
                  !item.available ? 'opacity-50 bg-gray-50' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-[#1d2e1b] truncate">{item.title}</p>
                  <p className="text-[10px] text-gray-500 font-medium">{item.category}</p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Edición de precio para Admin */}
                  {isAdmin && editingId === item.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-16 p-1 border rounded text-xs font-bold"
                      />
                      <button onClick={() => savePrice(item.id)} className="p-1 text-green-600">
                        <Save size={16} />
                      </button>
                    </div>
                  ) : (
                    <span className="font-black text-sm text-[#1d2e1b]">
                      ${item.price}
                    </span>
                  )}

                  {/* Opciones de edición si es Admin */}
                  {isAdmin && (
                    <div className="flex items-center gap-1 pl-2 border-l border-gray-200">
                      <button
                        onClick={() => { setEditingId(item.id); setEditPrice(item.price); }}
                        className="p-1 text-gray-400 hover:text-gray-700"
                      >
                        <Edit3 size={14} />
                      </button>

                      <button
                        onClick={() => toggleAvailable(item.id, item.available)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {item.available ? 'Activo' : 'Agotado'}
                      </button>

                      <button onClick={() => deleteProduct(item.id)} className="p-1 text-red-400 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL PARA INGRESAR EL PIN (ACCESO POR CANDADO) */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xs rounded-3xl p-6 border-2 border-[#1d2e1b] shadow-2xl relative text-center">
            <button
              onClick={() => { setIsPinModalOpen(false); setPinError(''); setPin(''); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <div className="w-12 h-12 bg-[#e8edd6] text-[#1d2e1b] rounded-full flex items-center justify-center mx-auto mb-3">
              <Lock size={24} />
            </div>

            <h3 className="font-extrabold text-base text-[#1d2e1b] mb-1">Acceso Administrador</h3>
            <p className="text-xs text-gray-500 mb-4">Ingresa tu PIN de 4 dígitos</p>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="****"
                className="w-full text-center text-2xl font-black tracking-widest p-2.5 border-2 border-gray-200 rounded-2xl focus:border-[#1d2e1b] outline-none"
                autoFocus
              />

              {pinError && (
                <p className="text-xs text-red-500 font-bold">{pinError}</p>
              )}

              <button
                type="submit"
                className="w-full bg-[#1d2e1b] text-[#95c623] py-3 rounded-2xl font-extrabold text-xs shadow-md active:scale-95 transition-all"
              >
                Ingresar al Panel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}