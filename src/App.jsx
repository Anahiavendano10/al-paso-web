import React, { useState, useEffect } from 'react';
import { 
  Lock, LogOut, Search, ShoppingCart, Plus, Minus, X, 
  MapPin, Settings, Power, Menu, Instagram, Facebook, Star, RefreshCw 
} from 'lucide-react';
import { supabase } from './supabase';

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Estado del local y servicios (Configurables desde Admin)
  const [isOpenLocal, setIsOpenLocal] = useState(true);
  const [isDeliveryAvailable, setIsDeliveryAvailable] = useState(false);
  const [isRetiroAvailable, setIsRetiroAvailable] = useState(true);

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
  const DIRECCION_REAL = "Emilio Bottini 1703, Sargento Cabral, Jujuy";
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
      { name: 'Empanada Pollo al Champiñón', description: 'Pollo en salsa de champiñones a la crema', price: 1500, category: 'Empanadas', available: true, image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=400&auto=format&fit=crop' },
      { name: 'Empanada de Matambre', description: 'Matambre tierno tiernizado y condimentado', price: 1500, category: 'Empanadas', available: true, image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=400&auto=format&fit=crop' }
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

  const categories = [
    'Todos', 
    'Promos 🏷️', 
    'Empanadas 🥟', 
    'Sándwiches 🥪', 
    'Hamburguesas 🍔', 
    'Bebidas 🥤'
  ];
  
  const filteredProducts = products.filter(p => {
    const matchesSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const baseSelectedCat = selectedCategory.split(' ')[0].toLowerCase()
      .replace('sándwiches', 'sandwiches') 
      .replace('promos', 'promos')
      .replace('hamburguesas', 'hamburguesas')
      .replace('empanadas', 'empanadas')
      .replace('bebidas', 'bebidas');

    const baseProductCat = (p.category || '').toLowerCase()
      .replace('sándwiches', 'sandwiches')
      .replace('sandwiches', 'sandwiches');

    const matchesCat = selectedCategory === 'Todos' || baseProductCat === baseSelectedCat;
    
    return matchesSearch && matchesCat;
  });

  const isSpecialEmpanada = (item) => {
    if (!item || item.category !== 'Empanadas') return false;
    const nameLower = item.name.toLowerCase();
    return nameLower.includes('champi') || nameLower.includes('matambre');
  };

  const openProductDetail = (prod) => {
    if (!prod.available) return;
    setSelectedProduct(prod);
    
    const qtyInicial = (prod.category === 'Empanadas' || prod.category === 'Promos') ? 0 : 1;
    setProductQuantity(qtyInicial);
    setProductNotes('');
  };

  const calculateTotalPrice = (prod, qty) => {
    if (!prod) return 0;
    if (prod.category === 'Empanadas') {
      const isEspecial = isSpecialEmpanada(prod);
      const docenas = Math.floor(qty / 12);
      const restoDocena = qty % 12;
      const medias = Math.floor(restoDocena / 6);
      const unidadesSueltas = restoDocena % 6;

      const precioDocena = isEspecial ? 16000 : 14000;
      const precioMedia = isEspecial ? 8000 : 7000;
      const precioUnidad = 1500;

      return (docenas * precioDocena) + (medias * precioMedia) + (unidadesSueltas * precioUnidad);
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
      notes: (selectedProduct.category === 'Sandwiches' || selectedProduct.category === 'Hamburguesas') ? productNotes : '',
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
    <div style={{ backgroundColor: '#E8Edd6' }} className="min-h-screen text-slate-900 font-sans pb-24">

      {/* HEADER SUPERIOR NEGRO */}
      <header className="bg-[#121212] text-white px-5 py-3.5 flex justify-between items-center sticky top-0 z-30 shadow-md">
        <div className="max-w-md md:max-w-3xl w-full mx-auto flex justify-between items-center">
          <button
            onClick={() => setIsInfoModalOpen(true)}
            className="p-1 text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <Menu size={22} />
          </button>

          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsInfoModalOpen(true)}>
            <h1 className="text-2xl font-black tracking-tight text-white uppercase">AL PASO</h1>
            <span className={`w-3 h-3 rounded-full ${isOpenLocal ? 'bg-[#95c623]' : 'bg-red-500'}`} />
          </div>

          <div className="flex items-center gap-2">
            {isAdmin ? (
              <button
                onClick={handleLogout}
                style={{ backgroundColor: '#95c623' }}
                className="text-black p-1.5 rounded-full"
                title="Salir de Modo Admin"
              >
                <LogOut size={16} />
              </button>
            ) : (
              <button
                onClick={() => setIsPinModalOpen(true)}
                className="p-1.5 text-white/80 hover:bg-white/10 rounded-full"
                title="Acceso Administración"
              >
                <Settings size={20} />
              </button>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              style={{ backgroundColor: '#95c623' }}
              className="text-black px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-black text-xs shadow-sm hover:opacity-95 transition-all"
            >
              <ShoppingCart size={16} className="stroke-[2.5]" />
              <span>{cart.length}</span>
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <div className="max-w-md md:max-w-3xl mx-auto px-4 mt-3 space-y-4">

        {/* TARJETA NEGRA CON IMAGEN DE FONDO (ALARGADA AL ANCHO COMPLETO DEL BUSCADOR) */}
        <div className="relative rounded-[2rem] overflow-hidden bg-black shadow-md w-full">
          <div className="h-44 relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop"
              alt="Portada AL PASO"
              className="w-full h-full object-cover opacity-75"
            />
          </div>

          <div className="p-3 bg-transparent -mt-20 relative z-10">
            <div className="bg-[#121212] rounded-[1.8rem] p-5 shadow-2xl text-white space-y-3 border border-white/10">
              
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black tracking-tight text-white uppercase">AL PASO</h2>
                
                <span style={{ backgroundColor: isOpenLocal ? '#95c623' : '#ef4444' }} className="text-black px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                  {isOpenLocal ? 'ABIERTO' : 'CERRADO'}
                </span>
              </div>

              <p className="text-xs font-extrabold text-gray-300 tracking-widest uppercase">
                EMPANADERÍA Y SÁNDWICHERÍA
              </p>

              <div className="flex items-center gap-1.5 text-xs text-gray-300 font-medium">
                <MapPin size={16} style={{ color: '#95c623' }} className="shrink-0" />
                <span>{DIRECCION_REAL}</span>
              </div>

              {/* BOTONES INFERIORES: RETIRO Y DELIVERY */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  style={{ backgroundColor: isRetiroAvailable ? '#95c623' : '#1e1e1e' }}
                  className={`py-2.5 px-4 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all ${
                    isRetiroAvailable
                      ? 'text-black shadow-sm'
                      : 'border border-white/10 text-gray-500 opacity-60'
                  }`}
                >
                  🛍️ Retiro {!isRetiroAvailable && <span className="text-[10px] font-normal">(No disponible)</span>}
                </button>

                <button
                  style={{ backgroundColor: isDeliveryAvailable ? '#95c623' : '#1e1e1e' }}
                  className={`py-2.5 px-4 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all ${
                    isDeliveryAvailable
                      ? 'text-black'
                      : 'border border-white/10 text-gray-400 opacity-70'
                  }`}
                >
                  🛵 Delivery {!isDeliveryAvailable && <span className="text-[10px] font-normal">(No disponible)</span>}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MODO ADMINISTRADOR */}
        {isAdmin && (
          <div className="bg-white border-2 border-black rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <span className="font-extrabold text-xs text-black flex items-center gap-1">
                  <Settings size={14} /> Panel de Administración
                </span>
                <p className="text-[10px] text-gray-600">Configura el estado de atención de AL PASO</p>
              </div>

              <button
                onClick={() => setIsOpenLocal(!isOpenLocal)}
                className={`px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1 transition-all ${
                  isOpenLocal ? 'bg-black text-white' : 'bg-red-600 text-white'
                }`}
              >
                <Power size={12} />
                {isOpenLocal ? 'ABIERTO' : 'CERRADO'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setIsRetiroAvailable(!isRetiroAvailable)}
                className={`py-2 px-3 rounded-xl text-xs font-extrabold border transition-all ${
                  isRetiroAvailable 
                    ? 'bg-green-100 border-green-500 text-green-900' 
                    : 'bg-red-50 border-red-300 text-red-700'
                }`}
              >
                🛍️ Retiro: {isRetiroAvailable ? 'Disponible' : 'No disponible'}
              </button>

              <button
                onClick={() => setIsDeliveryAvailable(!isDeliveryAvailable)}
                className={`py-2 px-3 rounded-xl text-xs font-extrabold border transition-all ${
                  isDeliveryAvailable 
                    ? 'bg-green-100 border-green-500 text-green-900' 
                    : 'bg-red-50 border-red-300 text-red-700'
                }`}
              >
                🛵 Delivery: {isDeliveryAvailable ? 'Disponible' : 'No disponible'}
              </button>
            </div>

            <button
              onClick={seedEmpanadasInSupabase}
              className="w-full bg-black text-white py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-xs transition-all hover:opacity-90"
            >
              <RefreshCw size={12} /> Restablecer Empanadas en Supabase
            </button>
          </div>
        )}

        {/* BUSCADOR BLANCO */}
        <div className="space-y-3">
          <div className="bg-white rounded-2xl px-4 py-3 flex items-center gap-2 shadow-sm">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Buscar tu plato favorito..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs font-medium outline-none text-black placeholder:text-gray-400"
            />
          </div>

          {/* GRID DE CATEGORÍAS */}
          <div className="grid grid-cols-3 gap-2 py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full h-12 px-1 rounded-2xl text-[11px] font-extrabold text-center flex items-center justify-center transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#121212] text-[#95c623] shadow-md'
                    : 'bg-white text-black hover:bg-gray-50'
                }`}
              >
                <span className="truncate">{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* LISTA DE PRODUCTOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {loading ? (
            <p className="col-span-full text-center text-xs text-black font-bold py-8">Cargando menú...</p>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-8 space-y-3">
              <p className="text-xs text-black font-bold">No hay productos disponibles en esta sección</p>
              {selectedCategory.includes('Empanadas') && (
                <button
                  onClick={seedEmpanadasInSupabase}
                  className="bg-black text-white px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <RefreshCw size={12} /> Cargar todas las empanadas ahora
                </button>
              )}
            </div>
          ) : (
            filteredProducts.map((item) => {
              const especial = isSpecialEmpanada(item);
              return (
                <div
                  key={item.id}
                  onClick={() => openProductDetail(item)}
                  className={`bg-white rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between ${
                    item.available ? 'cursor-pointer hover:shadow-md transition-all active:scale-[0.99]' : 'opacity-60'
                  }`}
                >
                  <div className="h-44 w-full bg-gray-100 relative">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=600&auto=format&fit=crop'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />

                    {especial && (
                      <span className="absolute top-3 left-3 bg-[#121212]/90 backdrop-blur-xs text-[#95c623] text-[9px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 tracking-wider uppercase">
                        <Star size={9} className="fill-[#95c623]" /> DESTACADO
                      </span>
                    )}

                    {!item.available && (
                      <span className="absolute top-3 right-3 bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded-full uppercase">
                        AGOTADO
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-extrabold text-base text-black">{item.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {item.description || item.category}
                    </p>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-baseline gap-1">
                        {item.category === 'Empanadas' ? (
                          <div>
                            <span className="text-xl font-black text-black">
                              ${especial ? '16.000' : '14.000'}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold ml-1">doc.</span>
                          </div>
                        ) : (
                          <span className="text-xl font-black text-black">
                            ${Math.round(item.price)}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        style={{ backgroundColor: '#95c623' }}
                        className="text-black font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1 shadow-xs hover:opacity-90 active:scale-95 transition-all"
                      >
                        + Agregar
                      </button>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="px-4 pb-3 border-t border-gray-100 pt-2 flex justify-end" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleAvailable(item.id, item.available)}
                        className={`px-3 py-1 rounded-xl text-[10px] font-black transition-all ${
                          item.available ? 'bg-red-600 text-white' : 'bg-black text-white'
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
            style={{ backgroundColor: '#95c623' }}
            className="w-full text-black py-3.5 px-5 rounded-2xl font-black text-xs flex justify-between items-center shadow-2xl active:scale-98 transition-all hover:opacity-95"
          >
            <div className="flex items-center gap-2">
              <span className="bg-black text-[#95c623] w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black">
                {cart.length}
              </span>
              <span>Ver mi pedido</span>
            </div>
            <span className="text-sm font-black">${totalCartPrice}</span>
          </button>
        </div>
      )}

      {/* MODAL DE INFORMACIÓN DEL LOCAL */}
      {isInfoModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 max-h-[85vh] overflow-y-auto relative">
            <button
              onClick={() => setIsInfoModalOpen(false)}
              className="absolute top-4 right-4 bg-gray-100 p-1.5 rounded-full text-black hover:bg-gray-200"
            >
              <X size={18} />
            </button>

            <div className="text-center space-y-2 mb-6">
              <div className="w-16 h-16 bg-[#121212] text-[#95c623] rounded-2xl flex items-center justify-center mx-auto text-xl font-black shadow-md">
                AP
              </div>
              <h2 className="text-2xl font-black text-gray-900">AL PASO</h2>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Empanadería y Sandwichería</p>
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
                <div className="bg-[#121212] p-3 rounded-2xl space-y-2 text-white font-medium text-[11px]">
                  <div className="flex justify-between items-center border-b border-white/10 pb-1.5">
                    <span>Lunes a Sábado</span> 
                    <span style={{ color: '#95c623' }} className="font-bold text-right">
                      10:00 - 16:00<br />19:00 - 00:30
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-0.5">
                    <span>Domingos</span> 
                    <span style={{ color: '#95c623' }} className="font-bold">10:00 - 16:00</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-extrabold text-gray-800 uppercase tracking-wider text-[10px] mb-2">Síguenos</h3>
                <div className="flex gap-3">
                  <a href={INSTAGRAM_LINK} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 bg-gray-100 px-3 py-2 rounded-xl font-bold text-black hover:bg-gray-200">
                    <Instagram size={14} /> Instagram
                  </a>
                  <a href={FACEBOOK_LINK} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 bg-gray-100 px-3 py-2 rounded-xl font-bold text-black hover:bg-gray-200">
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
                    <MapPin size={16} className="text-black shrink-0" />
                    <span className="text-xs font-bold text-black">{DIRECCION_REAL}</span>
                  </div>

                  <a
                    href={MAPS_LINK}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full text-center bg-[#121212] text-[#95c623] py-2.5 rounded-xl font-bold text-xs hover:bg-black transition-all active:scale-95 shadow-sm"
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
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[85vh] overflow-y-auto relative animate-in slide-in-from-bottom">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 bg-gray-100 p-1.5 rounded-full hover:bg-gray-200 transition-all z-10 text-black"
            >
              <X size={18} />
            </button>

            <div className="h-48 bg-gray-100 rounded-2xl overflow-hidden mb-4 relative">
              <img
                src={selectedProduct.image || 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=600&auto=format&fit=crop'}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex justify-between items-start gap-2 flex-wrap mb-1">
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-black text-black">{selectedProduct.name}</h3>
                  {isSpecialEmpanada(selectedProduct) && (
                    <span className="bg-[#121212] text-[#95c623] text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs">
                      <Star size={9} className="fill-[#95c623]" /> ESPECIAL
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedProduct.description || selectedProduct.category}
                </p>
              </div>

              {selectedProduct.category === 'Empanadas' && (
                <div className="text-right shrink-0 pt-0.5">
                  <span className="text-lg font-black text-black block">
                    ${isSpecialEmpanada(selectedProduct) ? '16000' : '14000'} doc.
                  </span>
                </div>
              )}
            </div>

            {selectedProduct.category === 'Empanadas' && (
              <div className="mt-4 pt-3 border-t border-gray-100 animate-fade-in">
                <p className="text-xs font-bold text-black mb-2">Sumar cantidad rápida:</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  
                  <div>
                    <button
                      type="button"
                      onClick={() => setProductQuantity(productQuantity + 1)}
                      className="w-full py-2.5 px-1 bg-gray-100 hover:bg-[#95c623] hover:text-black rounded-xl text-xs font-bold text-black transition-all active:scale-95 mb-1"
                    >
                      +1 Unidad
                    </button>
                    <span className="text-sm font-black text-black">$1500</span>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => setProductQuantity(productQuantity + 6)}
                      className="w-full py-2.5 px-1 bg-gray-100 hover:bg-[#95c623] hover:text-black rounded-xl text-xs font-bold text-black transition-all active:scale-95 mb-1"
                    >
                      +1/2 Docena
                    </button>
                    <span className="text-sm font-black text-black">
                      ${isSpecialEmpanada(selectedProduct) ? '8000' : '7000'}
                    </span>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => setProductQuantity(productQuantity + 12)}
                      className="w-full py-2.5 px-1 bg-gray-100 hover:bg-[#95c623] hover:text-black rounded-xl text-xs font-bold text-black transition-all active:scale-95 mb-1"
                    >
                      +1 Docena
                    </button>
                    <span className="text-sm font-black text-black">
                      ${isSpecialEmpanada(selectedProduct) ? '16000' : '14000'}
                    </span>
                  </div>

                </div>
              </div>
            )}

            {(selectedProduct.category === 'Sandwiches' || selectedProduct.category === 'Hamburguesas') && (
              <div className="mt-4 pt-3 border-t border-gray-100 animate-fade-in">
                <label className="block text-xs font-bold text-black mb-1.5">
                  Aderezos y verduras adicionales:
                </label>
                <textarea
                  rows="2"
                  placeholder="Ej: Con mayo, sin cebolla, agregar tomate extra..."
                  value={productNotes}
                  onChange={(e) => setProductNotes(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:border-black outline-none resize-none text-black"
                />
              </div>
            )}

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3 bg-gray-100 px-3 py-2 rounded-xl">
                <button 
                  type="button" 
                  onClick={() => setProductQuantity(Math.max(0, productQuantity - 1))}
                  className="p-1 font-bold text-black hover:opacity-70"
                >
                  <Minus size={14} />
                </button>
                <span className="font-extrabold text-sm min-w-[20px] text-center text-black">{productQuantity}</span>
                <button 
                  type="button" 
                  onClick={() => setProductQuantity(productQuantity + 1)}
                  className="p-1 font-bold text-black hover:opacity-70"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                type="button"
                onClick={addToCart}
                disabled={productQuantity === 0}
                style={{ backgroundColor: productQuantity > 0 ? '#95c623' : '#E5E7EB' }}
                className={`px-6 py-3 rounded-2xl font-black text-xs flex gap-2 transition-all ${
                  productQuantity > 0 
                    ? 'text-black cursor-pointer active:scale-95 shadow-md hover:opacity-95' 
                    : 'text-gray-400 cursor-not-allowed'
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
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[85vh] overflow-y-auto relative">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="font-black text-base text-black">Tu Pedido</h3>
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
                      <p className="font-extrabold text-xs text-black">{item.name} (x{item.quantity})</p>
                      {item.notes && <p className="text-[10px] text-gray-600 italic">Notas: {item.notes}</p>}
                      <p className="text-[10px] text-gray-500 font-bold">${item.totalPrice}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.cartId)} className="text-red-500 p-1">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t flex justify-between items-center font-black text-sm mb-4 text-black">
              <span>Total</span>
              <span>${totalCartPrice}</span>
            </div>

            <button
              onClick={handleSendWhatsApp}
              style={{ backgroundColor: '#95c623' }}
              className="w-full text-black py-3 rounded-2xl font-black text-xs transition-all active:scale-95 shadow-md hover:opacity-95"
            >
              Continuar con el pedido en WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* MODAL PIN ADMIN */}
      {isPinModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div style={{ backgroundColor: '#E8Edd6' }} className="w-full max-w-xs rounded-3xl p-6 relative text-center shadow-2xl border border-black/10">
            <button
              onClick={() => { setIsPinModalOpen(false); setPinError(''); setPin(''); }}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              <X size={18} />
            </button>

            <div style={{ backgroundColor: '#95c623' }} className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-black shadow-sm">
              <Lock size={22} />
            </div>

            <h3 className="font-black text-base text-black">Acceso Administrador</h3>
            <p className="text-xs text-gray-600 mb-4">Ingresa tu clave de dueño</p>

            <form onSubmit={handlePinSubmit} className="space-y-3">
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="****"
                className="w-full text-center text-2xl font-black p-3 bg-white border-2 border-black rounded-2xl outline-none text-black tracking-widest shadow-inner"
                autoFocus
              />

              {pinError && <p className="text-xs text-red-600 font-bold">{pinError}</p>}

              <button
                type="submit"
                style={{ backgroundColor: '#121212' }}
                className="w-full text-[#95c623] py-3 rounded-2xl font-black text-xs shadow-md active:scale-95 transition-all hover:bg-black"
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