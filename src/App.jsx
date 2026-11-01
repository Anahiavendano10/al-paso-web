import React, { useState, useEffect } from 'react';
import { 
  Lock, LogOut, Search, ShoppingBag, Plus, Minus, X, 
  MapPin, Settings, Power, Menu, Instagram, Facebook, Info, Star, RefreshCw 
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
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productQuantity, setProductQuantity] = useState(0);
  const [productNotes, setProductNotes] = useState('');

  // ==========================================
  // 🔴 DATOS DEL LOCAL
  // ==========================================
  const PHONE_NUMBER = "3884587924";
  const DIRECCION_REAL = "EMILIO BOTTINI 1703, SARGENTO CABRAL, JUJUY";
  const MAPS_LINK = "https://www.google.com/maps/place/%22Al+paso%22+empanaderia+y+sandwicheria/@-24.2266788,-65.2757969,19z";
  const IFRAME_SRC = "https://www.google.com/maps/embed?pb=%211m14%211m8%211m3%211d454.804006856018%212d-65.27579691485312%213d-24.226678810345796%213m2%211i1024%212i768%214f13.1%213m3%211m2%211s0x941b0757d2520663%3A0xaa1f3bf3ba4421f5%212s%22Al%20paso%22%20empanaderia%20y%20sandwicheria%215e0%213m2%211ses-419%212sus%214v1793575439458%215m2%211ses-419%212sus";

  const INSTAGRAM_LINK = "https://www.instagram.com/tu_perfil_alpaso";
  const FACEBOOK_LINK = "https://www.facebook.com/tu_pagina_alpaso";

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

  const seedEmpanadasInSupabase = async () => {
    setLoading(true);
    await supabase.from('products').delete().eq('category', 'Empanadas');

    const empanadasList = [
      { name: 'Empanada de Pollo', description: 'Pollo deshesado condimentado con vegetales', price: 1500, category: 'Empanadas', available: true, image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=400&auto=format&fit=crop' },
      { name: 'Empanada de Carne', description: 'Carne jugosa cortada a cuchillo con especias', price: 1500, category: 'Empanadas', available: true, image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=400&auto=format&fit=crop' },
      { name: 'Empanada de Queso', description: 'Queso derretido artesanal', price: 1500, category: 'Empanadas', available: true, image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=400&auto=format&fit=crop' },
      { name: 'Empanada Caprese', description: 'Queso, tomate fresco y albahaca', price: 1500, category: 'Empanadas', available: true, image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=400&auto=format&fit=crop' },
      { name: 'Empanada Pollo y Jamón', description: 'Pollo tierno con trozos de jamón cocido', price: 1500, category: 'Empanadas', available: true, image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=400&auto=format&fit=crop' },
      { name: 'Empanada de Osobuco', description: 'Osobuco braseado lentamente', price: 1500, category: 'Empanadas', available: true, image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=400&auto=format&fit=crop' },
      { name: 'Empanada Árabe', description: 'Carne marinada con limón y especias orientales', price: 1500, category: 'Empanadas', available: true, image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=400&auto=format&fit=crop' },
      { name: 'Empanada Pollo al Champiñón', description: 'Pollo en salsa de champiñones a la crema', price: 1333.33, category: 'Empanadas', available: true, image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=400&auto=format&fit=crop' },
      { name: 'Empanada de Matambre', description: 'Matambre tierno tiernizado y condimentado', price: 1333.33, category: 'Empanadas', available: true, image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=400&auto=format&fit=crop' }
    ];

    await supabase.from('products').insert(empanadasList);
    fetchProducts();
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

  // Detección mejorada para Pollo al Champiñón y Matambre (con o sin tilde)
  const isSpecialEmpanada = (item) => {
    if (!item || item.category !== 'Empanadas') return false;
    const nameLower = item.name.toLowerCase();
    return nameLower.includes('champi') || nameLower.includes('matambre');
  };

  const openProductDetail = (prod) => {
    if (!prod.available) return;
    setSelectedProduct(prod);
    setProductQuantity(0);
    setProductNotes('');
  };

  const calculateTotalPrice = (prod, qty) => {
    if (!prod) return 0;
    if (prod.category === 'Empanadas') {
      const isEspecial = isSpecialEmpanada(prod);
      const docenas = Math.floor(qty / 12);
      const restoDocena = qty % 12;
      const medias = Math.floor(restoDocena / 6);
      const unidades = restoDocena % 6;

      const precioDocena = isEspecial ? 16000 : 14000;
      const precioMedia = isEspecial ? 8000 : 7000;
      const precioUnidad = isEspecial ? 1333.33 : 1500;

      return Math.round((docenas * precioDocena) + (medias * precioMedia) + (unidades * precioUnidad));
    }
    return Math.round(prod.price * qty);
  };

  const addToCart = () => {
    if (!selectedProduct || productQuantity <= 0) return;

    const computedTotal = calculateTotalPrice(selectedProduct, productQuantity);

    const itemToAdd = {
      ...selectedProduct,
      cartId: Date.now(),
      quantity: productQuantity,
      notes: selectedProduct.category === 'Sandwiches' ? productNotes : '',
      totalPrice: computedTotal
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

  const handleSendWhatsApp = () => {
    if (cart.length === 0) return;

    let message = `*¡Hola AL PASO! Quiero realizar el siguiente pedido:*\n\n`;

    cart.forEach((item) => {
      message += `• *${item.name}* (x${item.quantity}) - $${item.totalPrice}\n`;
      if (item.notes) {
        message += `   _Detalle: ${item.notes}_\n`;
      }
    });

    message += `\n*Total a pagar: $${totalCartPrice}*`;
    message += `\n\nQuedo a la espera de la confirmación. ¡Muchas gracias!`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-[#1e1e1e] font-sans pb-24">

      {/* HEADER SUPERIOR */}
      <header className="bg-white px-5 py-3.5 flex justify-between items-center shadow-xs sticky top-0 z-30 border-b border-gray-100">
        <div className="max-w-md md:max-w-3xl w-full mx-auto flex justify-between items-center">
          <button
            onClick={() => setIsInfoModalOpen(true)}
            className="p-1 text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
          >
            <Menu size={22} />
          </button>

          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setIsInfoModalOpen(true)}>
            <h1 className="text-xl font-black tracking-wider text-black">AL PASO</h1>
            <span className={`w-2.5 h-2.5 rounded-full ${isOpenLocal ? 'bg-[#95c623]' : 'bg-red-500'}`} />
          </div>

          <div className="flex items-center gap-2">
            {isAdmin ? (
              <button
                onClick={handleLogout}
                className="bg-black text-white p-1.5 rounded-full"
                title="Salir de Modo Admin"
              >
                <LogOut size={16} />
              </button>
            ) : (
              <button
                onClick={() => setIsPinModalOpen(true)}
                className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-full"
                title="Acceso Administración"
              >
                <Settings size={20} />
              </button>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className="p-1.5 text-gray-800 hover:bg-gray-100 rounded-full relative"
            >
              <ShoppingBag size={22} />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 bg-black text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <div className="max-w-md md:max-w-3xl mx-auto px-4 mt-4 space-y-4">

        {/* PORTADA Y TARJETA FLOTANTE */}
        <div className="relative rounded-[2rem] overflow-hidden bg-[#0d141e] shadow-md border border-gray-200/60 max-w-md mx-auto">
          <div className="h-56 relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop"
              alt="Portada AL PASO"
              className="w-full h-full object-cover opacity-90"
            />
          </div>

          <div className="p-3 bg-transparent -mt-28 relative z-10">
            <div className="bg-white rounded-[1.8rem] p-5 shadow-xl border border-gray-100 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black text-black tracking-tight">AL PASO</h2>
                  <p className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase mt-0.5">
                    EMPANADERÍA Y SÁNDWICHERÍA
                  </p>
                </div>

                <button
                  onClick={() => setIsInfoModalOpen(true)}
                  className="text-[#95c623] p-1 hover:bg-lime-50 rounded-full transition-all"
                >
                  <Info size={24} />
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold pt-0.5">
                <MapPin size={16} className="text-[#95c623] shrink-0" />
                <span>{DIRECCION_REAL}</span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isOpenLocal ? 'bg-[#95c623]' : 'bg-red-500'}`} />
                  <span className="font-extrabold text-xs text-black">
                    {isOpenLocal ? 'Abierto' : 'Cerrado'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="bg-[#f2f4f8] text-slate-700 px-3 py-1.5 rounded-xl text-[10px] font-extrabold flex items-center gap-1">
                    🛵 Delivery
                  </span>
                  <span className="bg-[#f2f4f8] text-slate-700 px-3 py-1.5 rounded-xl text-[10px] font-extrabold flex items-center gap-1">
                    🛍️ Retiro
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MODO ADMINISTRADOR */}
        {isAdmin && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 space-y-2 shadow-sm max-w-md mx-auto">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-extrabold text-xs text-amber-900 flex items-center gap-1">
                  <Settings size={14} /> Modo Administrador
                </span>
                <p className="text-[10px] text-amber-700">Cambia horario o marca productos agotados</p>
              </div>

              <button
                onClick={() => setIsOpenLocal(!isOpenLocal)}
                className={`px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1 transition-all ${
                  isOpenLocal ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                }`}
              >
                <Power size={12} />
                {isOpenLocal ? 'ABIERTO' : 'CERRADO'}
              </button>
            </div>

            <button
              onClick={seedEmpanadasInSupabase}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-1.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-xs transition-all"
            >
              <RefreshCw size={12} /> Cargar / Restablecer Sabores de Empanadas
            </button>
          </div>
        )}

        {/* BÚSQUEDA Y CATEGORÍAS */}
        <div className="space-y-3">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {loading ? (
            <p className="col-span-full text-center text-xs text-gray-400 py-8">Cargando menú...</p>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-8 space-y-3">
              <p className="text-xs text-gray-400">No hay productos disponibles en esta sección</p>
              <button
                onClick={seedEmpanadasInSupabase}
                className="bg-black text-white px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
              >
                <RefreshCw size={12} /> Cargar todas las empanadas ahora
              </button>
            </div>
          ) : (
            filteredProducts.map((item) => {
              const especial = isSpecialEmpanada(item);
              return (
                <div
                  key={item.id}
                  onClick={() => openProductDetail(item)}
                  className={`bg-white rounded-2xl p-3 shadow-sm border flex items-center justify-between gap-3 relative overflow-hidden ${
                    especial ? 'border-amber-200 bg-gradient-to-r from-amber-50/30 to-white' : 'border-gray-100'
                  } ${
                    item.available ? 'cursor-pointer hover:shadow-md transition-all active:scale-[0.99]' : 'opacity-60 bg-gray-50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-extrabold text-sm text-gray-900 truncate">{item.name}</h3>

                      {/* BADGE ESPECIAL ⭐ */}
                      {especial && (
                        <span className="bg-amber-400 text-amber-950 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs">
                          <Star size={9} className="fill-amber-950" /> ESPECIAL
                        </span>
                      )}

                      {!item.available && (
                        <span className="bg-red-100 text-red-700 text-[9px] font-black px-1.5 py-0.5 rounded">
                          AGOTADO
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{item.description || item.category}</p>
                    
                    {/* PRECIO DESTACADO EN GRANDE: DOCENA */}
                    <div className="flex items-center gap-2 mt-2">
                      {item.category === 'Empanadas' ? (
                        <>
                          <span className="font-black text-sm text-gray-900">
                            ${especial ? '16.000' : '14.000'} doc.
                          </span>
                          <span className="text-[10px] font-bold text-gray-400">
                            (${Math.round(item.price)} u.)
                          </span>
                        </>
                      ) : (
                        <span className="font-black text-sm text-gray-900">
                          ${Math.round(item.price)}
                        </span>
                      )}
                    </div>
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
              );
            })
          )}
        </div>

      </div>

      {/* CARRITO FLOTANTE */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-30">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 px-5 rounded-2xl font-black text-xs flex justify-between items-center shadow-xl active:scale-98 transition-all"
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

      {/* MODAL DE INFORMACIÓN DEL LOCAL */}
      {isInfoModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 max-h-[85vh] overflow-y-auto relative">
            <button
              onClick={() => setIsInfoModalOpen(false)}
              className="absolute top-4 right-4 bg-gray-100 p-1.5 rounded-full hover:bg-gray-200"
            >
              <X size={18} />
            </button>

            <div className="text-center space-y-2 mb-6">
              <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto text-xl font-black shadow-md">
                AP
              </div>
              <h2 className="text-xl font-black text-gray-900">AL PASO</h2>
              <p className="text-xs text-gray-500">Empanadería y Sandwichería</p>
            </div>

            <div className="space-y-4 text-xs border-t border-gray-100 pt-4">
              <div>
                <h3 className="font-extrabold text-gray-800 uppercase tracking-wider text-[10px] mb-1">Sobre Nosotros</h3>
                <p className="text-gray-600 leading-relaxed">
                  Ofrecemos las mejores empanadas artesanales cortadas a cuchillo y sándwiches completos preparados en el momento. ¡Ingredientes frescos y el verdadero sabor de casa!
                </p>
              </div>

              <div>
                <h3 className="font-extrabold text-gray-800 uppercase tracking-wider text-[10px] mb-2">Horarios de Atención</h3>
                <div className="bg-gray-50 p-3 rounded-2xl space-y-2 text-gray-600 font-medium text-[11px]">
                  <div className="flex justify-between items-center border-b border-gray-200/60 pb-1.5">
                    <span>Lunes a Sábado</span> 
                    <span className="font-bold text-gray-900 text-right">
                      10:00 - 16:00<br />19:00 - 00:30
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-0.5">
                    <span>Domingos</span> 
                    <span className="font-bold text-gray-900">10:00 - 16:00</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-extrabold text-gray-800 uppercase tracking-wider text-[10px] mb-2">Síguenos</h3>
                <div className="flex gap-3">
                  <a href={INSTAGRAM_LINK} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 bg-gray-100 px-3 py-2 rounded-xl font-bold text-gray-700 hover:bg-gray-200">
                    <Instagram size={14} /> Instagram
                  </a>
                  <a href={FACEBOOK_LINK} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 bg-gray-100 px-3 py-2 rounded-xl font-bold text-gray-700 hover:bg-gray-200">
                    <Facebook size={14} /> Facebook
                  </a>
                </div>
              </div>

              <div>
                <h3 className="font-extrabold text-gray-800 uppercase tracking-wider text-[10px] mb-2">Ubicación</h3>
                <div className="bg-gray-50 p-3.5 rounded-2xl space-y-3">
                  <div className="w-full h-36 bg-gray-200 rounded-xl overflow-hidden shadow-inner relative">
                    <iframe
                      title="Mapa AL PASO"
                      src={IFRAME_SRC}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                    ></iframe>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-[#95c623] shrink-0" />
                    <span className="text-xs font-bold text-gray-800">{DIRECCION_REAL}</span>
                  </div>

                  <a
                    href={MAPS_LINK}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full text-center bg-black text-white py-2.5 rounded-xl font-bold text-xs hover:bg-gray-800 transition-all active:scale-95 shadow-sm"
                  >
                    Abrir ubicación en Google Maps 📍
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE DE PRODUCTO */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[85vh] overflow-y-auto relative animate-in slide-in-from-bottom">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 bg-gray-100 p-1.5 rounded-full hover:bg-gray-200 transition-all"
            >
              <X size={18} />
            </button>

            <div className="h-44 bg-gray-100 rounded-2xl overflow-hidden mb-4">
              <img
                src={selectedProduct.image || 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=600&auto=format&fit=crop'}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black">{selectedProduct.name}</h3>
              {isSpecialEmpanada(selectedProduct) && (
                <span className="bg-amber-400 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Star size={10} className="fill-amber-950" /> ESPECIAL
                </span>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-1">{selectedProduct.description || selectedProduct.category}</p>

            {selectedProduct.category === 'Empanadas' && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-700 mb-2">Sumar cantidad rápida:</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setProductQuantity(productQuantity + 1)}
                    className="py-2 px-3 bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-500 rounded-xl text-xs font-bold text-gray-800 hover:text-emerald-700 transition-all active:scale-95"
                  >
                    +1 Unidad
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductQuantity(productQuantity + 6)}
                    className="py-2 px-3 bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-500 rounded-xl text-xs font-bold text-gray-800 hover:text-emerald-700 transition-all active:scale-95"
                  >
                    +1/2 Docena
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductQuantity(productQuantity + 12)}
                    className="py-2 px-3 bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-500 rounded-xl text-xs font-bold text-gray-800 hover:text-emerald-700 transition-all active:scale-95"
                  >
                    +1 Docena
                  </button>
                </div>
              </div>
            )}

            {selectedProduct.category === 'Sandwiches' && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Aderezos y verduras adicionales:
                </label>
                <textarea
                  rows="2"
                  placeholder="Ej: Con mayo, sin cebolla, agregar tomate extra..."
                  value={productNotes}
                  onChange={(e) => setProductNotes(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-medium focus:border-black outline-none resize-none bg-gray-50"
                />
              </div>
            )}

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3 bg-gray-100 px-3 py-1.5 rounded-xl">
                <button 
                  type="button" 
                  onClick={() => setProductQuantity(Math.max(0, productQuantity - 1))}
                  className="p-1 font-bold text-gray-700 hover:text-black"
                >
                  <Minus size={14} />
                </button>
                <span className="font-extrabold text-sm min-w-[20px] text-center">{productQuantity}</span>
                <button 
                  type="button" 
                  onClick={() => setProductQuantity(productQuantity + 1)}
                  className="p-1 font-bold text-gray-700 hover:text-black"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                type="button"
                onClick={addToCart}
                disabled={productQuantity === 0}
                className={`px-6 py-3 rounded-2xl font-black text-xs flex gap-2 transition-all ${
                  productQuantity > 0 
                    ? 'bg-black hover:bg-gray-800 text-white cursor-pointer active:scale-95 shadow-md' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>Añadir</span>
                <span>${calculateTotalPrice(selectedProduct, productQuantity)}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CARRITO / WHATSAPP */}
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
                      {item.notes && <p className="text-[10px] text-gray-500 italic">Notas: {item.notes}</p>}
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
              onClick={handleSendWhatsApp}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-2xl font-black text-xs transition-all active:scale-95"
            >
              Continuar con el pedido en WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* MODAL PIN ADMIN */}
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