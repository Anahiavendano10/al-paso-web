import React, { useState, useEffect } from 'react';
import { 
  Lock, LogOut, Search, ShoppingBag, Plus, Minus, X, 
  MapPin, Clock, Phone, Settings, Power, Trash2, Edit3, Save 
} from 'lucide-react';
import { supabase } from './supabase';

export default function App() {
  // --- ESTADOS DE AUTENTICACIÓN ADMIN ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  // --- ESTADOS DE LA TIENDA Y MENÚ ---
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpenLocal, setIsOpenLocal] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  // --- CARRITO Y MODALES ---
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productQuantity, setProductQuantity] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState([]);

  // --- FORMULARIO ADMIN ---
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('Empanadas');
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState('');

  // Cargar datos
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
    if (!error && data) setProducts(data);
    setLoading(false);
  };

  // Login de Admin con PIN
  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin === '2026') {
      setIsAdmin(true);
      localStorage.setItem('alpaso_admin_active', 'true');
      setIsPinModalOpen(false);
      setPin('');
      setPinError('');
    } else {
      setPinError('PIN Incorrecto');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('alpaso_admin_active');
    setIsAdmin(false);
  };

  // Filtrado de productos
  const categories = ['Todos', 'Empanadas', 'Sandwiches', 'Bebidas'];
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'Todos' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Funciones de Carrito
  const openProductDetail = (prod) => {
    setSelectedProduct(prod);
    setProductQuantity(1);
    setSelectedExtras([]);
  };

  const addToCart = () => {
    if (!selectedProduct) return;
    const itemToAdd = {
      ...selectedProduct,
      cartId: Date.now(),
      quantity: productQuantity,
      totalPrice: selectedProduct.price * productQuantity
    };
    setCart([...cart, itemToAdd]);
    setSelectedProduct(null);
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const totalCartPrice = cart.reduce((acc, item) => acc + item.totalPrice, 0);

  // Funciones CRUD Admin
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
      if (!error) setProducts(products.filter(p => p.id !== id));
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
    <div className="min-h-screen bg-[#f4f5f7] text-[#1e1e1e] font-sans pb-24">

      {/* HEADER SUPERIOR */}
      <header className="bg-white px-4 py-3 flex justify-between items-center shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-black tracking-tight text-gray-900">AL PASO</h1>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin ? (
            <button
              onClick={handleLogout}
              className="bg-black text-white px-3 py-1.5 rounded-full font-bold text-xs flex items-center gap-1"
            >
              <LogOut size={12} /> Salir Admin
            </button>
          ) : (
            <button
              onClick={() => setIsPinModalOpen(true)}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-full"
            >
              <Lock size={18} />
            </button>
          )}

          <button
            onClick={() => setIsCartOpen(true)}
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-full relative"
          >
            <ShoppingBag size={20} />
            {cart.length > 0 && (
              <span className="absolute top-1 right-1 bg-black text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* BANNER DE PORTADA PRINCIPAL */}
      <div className="relative h-44 bg-slate-900 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1561758033-d89a9ad46330?q=80&w=800&auto=format&fit=crop"
          alt="Portada AL PASO"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
          <div className="text-white">
            <h2 className="text-2xl font-black">AL PASO</h2>
            <p className="text-xs text-gray-300">Empanadería y Sandwichería</p>
          </div>
        </div>
      </div>

      {/* TARJETA DE INFORMACIÓN DEL LOCAL */}
      <div className="max-w-md mx-auto -mt-6 px-4 relative z-10">
        <div className="bg-white rounded-2xl p-4 shadow-md space-y-2 border border-gray-100">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
            <MapPin size={14} className="text-red-500" />
            <span>Local AL PASO</span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100">
            <div className="flex items-center gap-1.5 font-bold">
              <span className={`w-2 h-2 rounded-full ${isOpenLocal ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>{isOpenLocal ? 'Abierto' : 'Cerrado'}</span>
            </div>
            <span className="text-gray-500">Delivery disponible</span>
          </div>
        </div>
      </div>

      {/* CONTROLES DE ADMINISTRADOR (SOLO VISIBLE SI ES ADMIN) */}
      {isAdmin && (
        <div className="max-w-md mx-auto px-4 mt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-extrabold text-xs text-amber-900 flex items-center gap-1">
                <Settings size={14} /> Panel de Administrador
              </span>
              <button
                onClick={() => setIsOpenLocal(!isOpenLocal)}
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isOpenLocal ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                }`}
              >
                {isOpenLocal ? 'LOCAL ABIERTO' : 'LOCAL CERRADO'}
              </button>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-amber-200/60">
              <span className="text-xs font-bold text-amber-800">Gestionar Productos</span>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-black text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
              >
                <Plus size={12} /> Agregar Producto
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddProduct} className="bg-white p-3 rounded-xl border border-amber-200 space-y-2">
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
                <button type="submit" className="w-full bg-black text-white py-1.5 rounded-lg text-xs font-bold">
                  Guardar en Menú
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* BARRA DE BÚSQUEDA */}
      <div className="max-w-md mx-auto px-4 mt-4">
        <div className="bg-white rounded-2xl px-4 py-2.5 flex items-center gap-2 shadow-sm border border-gray-100">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Buscar tu plato favorito..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs font-semibold outline-none"
          />
        </div>
      </div>

      {/* CARROUSEL DE CATEGORÍAS */}
      <div className="max-w-md mx-auto px-4 mt-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* LISTA DE PRODUCTOS */}
      <div className="max-w-md mx-auto px-4 mt-4 space-y-3">
        {loading ? (
          <p className="text-center text-xs text-gray-400 py-8">Cargando menú...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center text-xs text-gray-400 py-8">No se encontraron productos</p>
        ) : (
          filteredProducts.map((item) => (
            <div
              key={item.id}
              onClick={() => !isAdmin && openProductDetail(item)}
              className={`bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex items-center justify-between gap-3 cursor-pointer transition-transform active:scale-[0.99] ${
                !item.available ? 'opacity-50 bg-gray-50' : ''
              }`}
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-extrabold text-sm text-gray-900 truncate">{item.title}</h3>
                <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{item.category}</p>
                <p className="font-black text-sm text-gray-900 mt-2">${item.price}</p>
              </div>

              <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=200&auto=format&fit=crop"
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* OPCIONES ADMIN EN LA TARJETA */}
              {isAdmin && (
                <div className="flex flex-col gap-1 pl-2 border-l border-gray-100" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => toggleAvailable(item.id, item.available)}
                    className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.available ? 'Activo' : 'Agotado'}
                  </button>
                  <button onClick={() => deleteProduct(item.id)} className="text-red-500 p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* BARRA INFERIOR DEL CARRITO (VER MI PEDIDO) */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-30">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-4 rounded-2xl font-black text-xs flex justify-between items-center shadow-lg active:scale-98 transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="bg-white/20 w-6 h-6 rounded-full flex items-center justify-center text-[11px]">
                {cart.length}
              </span>
              <span>Ver mi pedido</span>
            </div>
            <span>${totalCartPrice}</span>
          </button>
        </div>
      )}

      {/* MODAL DETALLE DE PRODUCTO */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[85vh] overflow-y-auto relative animate-in slide-in-from-bottom">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 bg-gray-100 p-1.5 rounded-full"
            >
              <X size={18} />
            </button>

            <div className="h-40 bg-gray-100 rounded-2xl overflow-hidden mb-4">
              <img
                src="https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=600&auto=format&fit=crop"
                alt={selectedProduct.title}
                className="w-full h-full object-cover"
              />
            </div>

            <h3 className="text-lg font-black">{selectedProduct.title}</h3>
            <p className="text-xs text-gray-500 mt-1">{selectedProduct.category}</p>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3 bg-gray-100 px-3 py-1.5 rounded-xl">
                <button
                  onClick={() => setProductQuantity(Math.max(1, productQuantity - 1))}
                  className="p-1 font-bold"
                >
                  <Minus size={14} />
                </button>
                <span className="font-extrabold text-sm">{productQuantity}</span>
                <button
                  onClick={() => setProductQuantity(productQuantity + 1)}
                  className="p-1 font-bold"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                onClick={addToCart}
                className="bg-black text-white px-6 py-3 rounded-2xl font-black text-xs flex gap-2"
              >
                <span>Añadir</span>
                <span>${selectedProduct.price * productQuantity}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DEL CARRITO */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[85vh] overflow-y-auto relative">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="font-black text-base">Tu Pedido</h3>
              <button onClick={() => setIsCartOpen(false)} className="p-1 text-gray-400">
                <X size={20} />
              </button>
            </div>

            {cart.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-8">Tu carrito está vacío</p>
            ) : (
              <div className="divide-y divide-gray-100 my-4">
                {cart.map((item) => (
                  <div key={item.cartId} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-extrabold text-xs">{item.title} (x{item.quantity})</p>
                      <p className="text-[10px] text-gray-400">${item.totalPrice}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.cartId)} className="text-red-500 p-1">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t flex justify-between items-center font-black text-sm mb-4">
              <span>Total</span>
              <span>${totalCartPrice}</span>
            </div>

            <button
              onClick={() => alert('¡Pedido enviado!')}
              className="w-full bg-emerald-500 text-white py-3 rounded-2xl font-black text-xs"
            >
              Continuar con el pedido
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE PIN PARA INGRESO ADMIN */}
      {isPinModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xs rounded-3xl p-6 relative text-center shadow-2xl">
            <button
              onClick={() => { setIsPinModalOpen(false); setPinError(''); setPin(''); }}
              className="absolute top-4 right-4 text-gray-400"
            >
              <X size={18} />
            </button>

            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-800">
              <Lock size={20} />
            </div>

            <h3 className="font-black text-sm text-gray-900">Acceso Administrador</h3>
            <p className="text-[11px] text-gray-400 mb-4">Ingresa tu clave de dueño</p>

            <form onSubmit={handlePinSubmit} className="space-y-3">
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="****"
                className="w-full text-center text-xl font-black p-2 border-2 border-gray-200 rounded-xl outline-none focus:border-black"
                autoFocus
              />

              {pinError && <p className="text-xs text-red-500 font-bold">{pinError}</p>}

              <button
                type="submit"
                className="w-full bg-black text-white py-2.5 rounded-xl font-black text-xs"
              >
                Ingresar
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}