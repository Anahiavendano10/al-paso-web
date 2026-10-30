import React, { useState, useEffect } from 'react';
import { 
  Lock, LogOut, Search, ShoppingBag, Plus, Minus, X, 
  MapPin, Settings, Power 
} from 'lucide-react';
import { supabase } from './supabase';

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpenLocal, setIsOpenLocal] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productQuantity, setProductQuantity] = useState(1);

  useEffect(() => {
    fetchProducts();
    if (localStorage.getItem('alpaso_admin_active') === 'true') {
      setIsAdmin(true);
    }
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('id', { ascending: true });
    if (!error && data) setProducts(data);
    setLoading(false);
  };

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

  const categories = ['Todos', 'Empanadas', 'Sandwiches', 'Bebidas'];
  const filteredProducts = products.filter(p => {
    const matchesSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'Todos' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const openProductDetail = (prod) => {
    if (!prod.available) return;
    setSelectedProduct(prod);
    setProductQuantity(1);
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

  const toggleAvailable = async (id, currentStatus) => {
    const { error } = await supabase.from('products').update({ available: !currentStatus }).eq('id', id);
    if (!error) {
      setProducts(products.map(p => p.id === id ? { ...p, available: !p.available } : p));
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-[#1e1e1e] font-sans pb-24">

      {/* HEADER */}
      <header className="bg-white px-4 py-3 flex justify-between items-center shadow-sm sticky top-0 z-30">
        <h1 className="text-lg font-black tracking-tight text-gray-900">AL PASO</h1>

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

      {/* PORTADA */}
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

      {/* DETALLE LOCAL */}
      <div className="max-w-md mx-auto -mt-6 px-4 relative z-10">
        <div className="bg-white rounded-2xl p-4 shadow-md space-y-2 border border-gray-100">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
            <MapPin size={14} className="text-red-500" />
            <span>Local AL PASO</span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100">
            <div className="flex items-center gap-1.5 font-bold">
              <span className={`w-2.5 h-2.5 rounded-full ${isOpenLocal ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={isOpenLocal ? 'text-green-700' : 'text-red-600'}>
                {isOpenLocal ? 'Abierto' : 'Cerrado'}
              </span>
            </div>
            <span className="text-gray-500">Delivery disponible</span>
          </div>
        </div>
      </div>

      {/* CONTROL ADMIN */}
      {isAdmin && (
        <div className="max-w-md mx-auto px-4 mt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex justify-between items-center">
            <div>
              <span className="font-extrabold text-xs text-amber-900 flex items-center gap-1">
                <Settings size={14} /> Modo Administrador
              </span>
              <p className="text-[10px] text-amber-700">Agotar productos o cambiar horario</p>
            </div>

            <button
              onClick={() => setIsOpenLocal(!isOpenLocal)}
              className={`px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1 ${
                isOpenLocal ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
              }`}
            >
              <Power size={12} />
              {isOpenLocal ? 'ABIERTO' : 'CERRADO'}
            </button>
          </div>
        </div>
      )}

      {/* BÚSQUEDA */}
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

      {/* CATEGORÍAS */}
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

      {/* LISTA DE PRODUCTOS (USA name, description e image) */}
      <div className="max-w-md mx-auto px-4 mt-4 space-y-3">
        {loading ? (
          <p className="text-center text-xs text-gray-400 py-8">Cargando menú...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center text-xs text-gray-400 py-8">No hay productos disponibles</p>
        ) : (
          filteredProducts.map((item) => (
            <div
              key={item.id}
              onClick={() => openProductDetail(item)}
              className={`bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex items-center justify-between gap-3 ${
                item.available ? 'cursor-pointer active:scale-[0.99]' : 'opacity-60 bg-gray-50'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-gray-900 truncate">{item.name}</h3>
                  {!item.available && (
                    <span className="bg-red-100 text-red-700 text-[9px] font-black px-1.5 py-0.5 rounded">
                      AGOTADO
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{item.description || item.category}</p>
                <p className="font-black text-sm text-gray-900 mt-2">${item.price}</p>
              </div>

              <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0 relative">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=200&auto=format&fit=crop'}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {isAdmin && (
                <div className="pl-2 border-l border-gray-100" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => toggleAvailable(item.id, item.available)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition-all ${
                      item.available 
                        ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {item.available ? 'Agotar' : 'Activar'}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* CARRITO INFERIOR */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-30">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-4 rounded-2xl font-black text-xs flex justify-between items-center shadow-lg"
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

      {/* MODAL DETALLE */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[85vh] overflow-y-auto relative">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 bg-gray-100 p-1.5 rounded-full"
            >
              <X size={18} />
            </button>

            <div className="h-40 bg-gray-100 rounded-2xl overflow-hidden mb-4">
              <img
                src={selectedProduct.image || 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=600&auto=format&fit=crop'}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
            </div>

            <h3 className="text-lg font-black">{selectedProduct.name}</h3>
            <p className="text-xs text-gray-500 mt-1">{selectedProduct.description || selectedProduct.category}</p>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3 bg-gray-100 px-3 py-1.5 rounded-xl">
                <button onClick={() => setProductQuantity(Math.max(1, productQuantity - 1))}>
                  <Minus size={14} />
                </button>
                <span className="font-extrabold text-sm">{productQuantity}</span>
                <button onClick={() => setProductQuantity(productQuantity + 1)}>
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

      {/* MODAL PEDIDO */}
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
                      <p className="font-extrabold text-xs">{item.name} (x{item.quantity})</p>
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

      {/* MODAL PIN */}
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