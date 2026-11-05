import React, { useState, useEffect } from 'react';
import { 
  Lock, LogOut, Search, ShoppingCart, Plus, Minus, X, 
  MapPin, Settings, Power, Menu, Instagram, Facebook, Star, RefreshCw, Pencil 
} from 'lucide-react';
import { supabase } from './supabase';

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [editingProduct, setEditingProduct] = useState(null);
  const [newPrice, setNewPrice] = useState('');

  const [editingEmpanadaPrice, setEditingEmpanadaPrice] = useState(null);
  const [newEmpanadaPriceValue, setNewEmpanadaPriceValue] = useState('');

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

  const PHONE_NUMBER = "+5493884718946";
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
    if (!error && data) {
      setProducts(data);
    }
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
    if (!item) return false;
    return item.is_featured === true;
  };

  const openProductDetail = (prod) => {
    if (!prod.available) return;
    setSelectedProduct(prod);
    
    const qtyInicial = (prod.category === 'Empanadas' || prod.category === 'Promos') ? 0 : 1;
    setProductQuantity(qtyInicial);
    setProductNotes('');
  };

  const getEmpanadaPrices = (prod) => {
    const isEspecial = isSpecialEmpanada(prod);
    const pUnit = prod.price_unit !== undefined && prod.price_unit !== null ? prod.price_unit : 1500;
    const pHalf = prod.price_half !== undefined && prod.price_half !== null ? prod.price_half : (isEspecial ? 8000 : 7000);
    const pDozen = prod.price_dozen !== undefined && prod.price_dozen !== null ? prod.price_dozen : (isEspecial ? 16000 : 14000);
    return { pUnit, pHalf, pDozen };
  };

  const calculateTotalPrice = (prod, qty) => {
    if (!prod) return 0;
    if (prod.category === 'Empanadas') {
      const { pUnit, pHalf, pDozen } = getEmpanadaPrices(prod);
      const docenas = Math.floor(qty / 12);
      const restoDocena = qty % 12;
      const medias = Math.floor(restoDocena / 6);
      const unidadesSueltas = restoDocena % 6;

      return (docenas * pDozen) + (medias * pHalf) + (unidadesSueltas * pUnit);
    }
    return Math.round((prod.price || 0) * qty);
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
    const nextStatus = !currentStatus;
    setProducts(products.map(p => p.id === id ? { ...p, available: nextStatus } : p));
    
    const { error } = await supabase.from('products').update({ available: nextStatus }).eq('id', id);
    if (error) {
      console.error("Error al actualizar disponible en Supabase:", error);
      fetchProducts();
    }
  };

  const toggleFeatured = async (id, currentFeatured) => {
    const nextFeatured = !(currentFeatured === true);
    setProducts(products.map(p => p.id === id ? { ...p, is_featured: nextFeatured } : p));

    const { error } = await supabase.from('products').update({ is_featured: nextFeatured }).eq('id', id);
    if (error) {
      console.error("Error al actualizar destacado en Supabase:", error);
      fetchProducts();
    }
  };

  const handleOpenPriceModal = (prod) => {
    setEditingProduct(prod);
    setNewPrice(prod.price || '');
  };

  const handleSavePrice = async (e) => {
    e.preventDefault();
    if (!editingProduct || !newPrice) return;

    const parsedPrice = parseFloat(newPrice);
    if (isNaN(parsedPrice) || parsedPrice < 0) return;

    setProducts(products.map(p => p.id === editingProduct.id ? { ...p, price: parsedPrice } : p));

    const { error } = await supabase
      .from('products')
      .update({ price: parsedPrice })
      .eq('id', editingProduct.id);

    if (error) {
      console.error("Error al guardar precio en Supabase:", error);
      fetchProducts();
    }

    setEditingProduct(null);
  };

  const handleOpenEmpanadaPriceModal = (prod, type, currentVal) => {
    setEditingEmpanadaPrice({ product: prod, type });
    setNewEmpanadaPriceValue(currentVal);
  };

  const handleSaveEmpanadaPrice = async (e) => {
    e.preventDefault();
    if (!editingEmpanadaPrice || newEmpanadaPriceValue === '') return;

    const parsedVal = parseFloat(newEmpanadaPriceValue);
    if (isNaN(parsedVal) || parsedVal < 0) return;

    const { product, type } = editingEmpanadaPrice;

    let updateData = {};
    if (type === 'unit') updateData = { price_unit: parsedVal };
    if (type === 'half') updateData = { price_half: parsedVal };
    if (type === 'dozen') updateData = { price_dozen: parsedVal };

    // Actualización local inmediata
    setProducts(products.map(p => p.id === product.id ? { ...p, ...updateData } : p));
    if (selectedProduct && selectedProduct.id === product.id) {
      setSelectedProduct({ ...selectedProduct, ...updateData });
    }

    // Guardar en Supabase
    const { error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', product.id);

    if (error) {
      console.error("Error al actualizar precio libre de empanada en Supabase:", error);
      fetchProducts();
    }

    setEditingEmpanadaPrice(null);
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
      <header className="bg-[#121212] text-white px-5 py-3.5 flex justify-between items-center sticky top-0 z-30 shadow-md">
        <div className="max-w-md md:max-w-3xl w-full mx-auto flex justify-between items-center">
          <button onClick={() => setIsInfoModalOpen(true)} className="p-1 text-white hover:bg-white/10 rounded-lg transition-all">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsInfoModalOpen(true)}>
            <h1 className="text-2xl font-black tracking-tight text-white uppercase">AL PASO</h1>
            <span className={`w-3 h-3 rounded-full ${isOpenLocal ? 'bg-[#95c623]' : 'bg-red-500'}`} />
          </div>
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <button onClick={handleLogout} style={{ backgroundColor: '#95c623' }} className="text-black p-1.5 rounded-full" title="Salir">
                <LogOut size={16} />
              </button>
            ) : (
              <button onClick={() => setIsPinModalOpen(true)} className="p-1.5 text-white/80 hover:bg-white/10 rounded-full" title="Admin">
                <Settings size={20} />
              </button>
            )}
            <button onClick={() => setIsCartOpen(true)} style={{ backgroundColor: '#95c623' }} className="text-black px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-black text-xs shadow-sm">
              <ShoppingCart size={16} className="stroke-[2.5]" />
              <span>{cart.length}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-md md:max-w-3xl mx-auto px-4 mt-3 space-y-4">
        <div className="relative rounded-[2rem] overflow-hidden bg-black shadow-md w-full">
          <div className="h-44 relative overflow-hidden">
            <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop" alt="Portada" className="w-full h-full object-cover opacity-75" />
          </div>
          <div className="p-3 bg-transparent -mt-20 relative z-10">
            <div className="bg-[#121212] rounded-[1.8rem] p-5 shadow-2xl text-white space-y-3 border border-white/10">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black tracking-tight text-white uppercase">AL PASO</h2>
                <span style={{ backgroundColor: isOpenLocal ? '#95c623' : '#ef4444' }} className="text-black px-3 py-1 rounded-full text-xs font-black uppercase">
                  {isOpenLocal ? 'ABIERTO' : 'CERRADO'}
                </span>
              </div>
              <p className="text-xs font-extrabold text-gray-300 tracking-widest uppercase">EMPANADERÍA Y SÁNDWICHERÍA</p>
              <div className="flex items-center gap-1.5 text-xs text-gray-300 font-medium">
                <MapPin size={16} style={{ color: '#95c623' }} className="shrink-0" />
                <span>{DIRECCION_REAL}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button style={{ backgroundColor: isRetiroAvailable ? '#95c623' : '#1e1e1e' }} className={`py-2.5 px-4 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 ${isRetiroAvailable ? 'text-black shadow-sm' : 'border border-white/10 text-gray-500 opacity-60'}`}>
                  🛍️ Retiro
                </button>
                <button style={{ backgroundColor: isDeliveryAvailable ? '#95c623' : '#1e1e1e' }} className={`py-2.5 px-4 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 ${isDeliveryAvailable ? 'text-black' : 'border border-white/10 text-gray-400 opacity-70'}`}>
                  🛵 Delivery
                </button>
              </div>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="bg-white border-2 border-black rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <span className="font-extrabold text-xs text-black flex items-center gap-1"><Settings size={14} /> Panel de Administración</span>
                <p className="text-[10px] text-gray-600">Configura el estado de atención</p>
              </div>
              <button onClick={() => setIsOpenLocal(!isOpenLocal)} className={`px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1 ${isOpenLocal ? 'bg-black text-white' : 'bg-red-600 text-white'}`}>
                <Power size={12} /> {isOpenLocal ? 'ABIERTO' : 'CERRADO'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button onClick={() => setIsRetiroAvailable(!isRetiroAvailable)} className={`py-2 px-3 rounded-xl text-xs font-extrabold border ${isRetiroAvailable ? 'bg-green-100 border-green-500 text-green-900' : 'bg-red-50 border-red-300 text-red-700'}`}>
                🛍️ Retiro: {isRetiroAvailable ? 'Disponible' : 'No'}
              </button>
              <button onClick={() => setIsDeliveryAvailable(!isDeliveryAvailable)} className={`py-2 px-3 rounded-xl text-xs font-extrabold border ${isDeliveryAvailable ? 'bg-green-100 border-green-500 text-green-900' : 'bg-red-50 border-red-300 text-red-700'}`}>
                🛵 Delivery: {isDeliveryAvailable ? 'Disponible' : 'No'}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="bg-white rounded-2xl px-4 py-3 flex items-center gap-2 shadow-sm">
            <Search size={18} className="text-gray-400" />
            <input type="text" placeholder="Buscar tu plato favorito..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-transparent text-xs font-medium outline-none text-black placeholder:text-gray-400" />
          </div>
          <div className="grid grid-cols-3 gap-2 py-1">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`w-full h-12 px-1 rounded-2xl text-[11px] font-extrabold text-center flex items-center justify-center ${selectedCategory === cat ? 'bg-[#121212] text-[#95c623] shadow-md' : 'bg-white text-black hover:bg-gray-50'}`}>
                <span className="truncate">{cat}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {loading ? (
            <p className="col-span-full text-center text-xs text-black font-bold py-8">Cargando menú...</p>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-xs text-black font-bold">No hay productos disponibles en esta sección</p>
            </div>
          ) : (
            filteredProducts.map((item) => {
              const especial = isSpecialEmpanada(item);
              const { pDozen } = getEmpanadaPrices(item);
              return (
                <div key={item.id} onClick={() => openProductDetail(item)} className={`bg-white rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between ${item.available ? 'cursor-pointer hover:shadow-md transition-all active:scale-[0.99]' : 'opacity-60'}`}>
                  <div className="h-44 w-full bg-gray-100 relative">
                    <img src={item.image || 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=600&auto=format&fit=crop'} alt={item.name} className="w-full h-full object-cover" />
                    {especial && (
                      <span className="absolute top-3 left-3 bg-[#121212]/90 text-[#95c623] text-[9px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 uppercase">
                        <Star size={9} className="fill-[#95c623]" /> DESTACADO
                      </span>
                    )}
                    {!item.available && (
                      <span className="absolute top-3 right-3 bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded-full uppercase">AGOTADO</span>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-extrabold text-base text-black">{item.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2">{item.description || item.category}</p>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1.5">
                        {item.category === 'Empanadas' ? (
                          <div>
                            <span className="text-xl font-black text-black">${Math.round(pDozen)}</span>
                            <span className="text-[10px] text-gray-400 font-bold ml-1">doc.</span>
                          </div>
                        ) : (
                          <span className="text-xl font-black text-black">${Math.round(item.price || 0)}</span>
                        )}
                        {isAdmin && item.category !== 'Empanadas' && (
                          <button type="button" onClick={(e) => { e.stopPropagation(); handleOpenPriceModal(item); }} className="p-1.5 bg-gray-100 hover:bg-black hover:text-[#95c623] text-gray-700 rounded-full" title="Editar precio">
                            <Pencil size={12} />
                          </button>
                        )}
                      </div>
                      <button type="button" style={{ backgroundColor: '#95c623' }} className="text-black font-extrabold text-xs px-4 py-2 rounded-xl shadow-xs">
                        + Agregar
                      </button>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="px-4 pb-4 border-t border-gray-100 pt-3 grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
                      <button type="button" onClick={() => toggleAvailable(item.id, item.available)} className={`w-full py-2 px-2 rounded-full text-xs font-black text-white ${item.available ? 'bg-red-500' : 'bg-gray-800'}`}>
                        {item.available ? 'Agotar' : 'Activar'}
                      </button>
                      <button type="button" onClick={() => toggleFeatured(item.id, item.is_featured)} className={`w-full py-2 px-2 rounded-full text-xs font-black flex items-center justify-center gap-1 ${item.is_featured === true ? 'bg-amber-400 text-black border border-amber-500' : 'bg-amber-100/80 text-amber-900 border border-amber-300'}`}>
                        <Star size={12} className={item.is_featured === true ? 'fill-black' : ''} />
                        {item.is_featured === true ? 'Destacado' : 'Destacar'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {editingProduct && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div style={{ backgroundColor: '#E8Edd6' }} className="w-full max-w-xs rounded-3xl p-6 relative text-center shadow-2xl border border-black/10">
            <button onClick={() => setEditingProduct(null)} className="absolute top-4 right-4 text-gray-500 hover:text-black"><X size={18} /></button>
            <div style={{ backgroundColor: '#95c623' }} className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-black shadow-sm"><Pencil size={22} /></div>
            <h3 className="font-black text-base text-black">Cambiar Precio</h3>
            <p className="text-xs text-gray-600 mb-4">{editingProduct.name}</p>
            <form onSubmit={handleSavePrice} className="space-y-3">
              <div className="relative">
                <span className="absolute left-4 top-3.5 font-black text-lg text-black">$</span>
                <input type="number" step="1" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="w-full text-center text-2xl font-black p-3 pl-8 bg-white border-2 border-black rounded-2xl outline-none text-black shadow-inner" autoFocus />
              </div>
              <button type="submit" style={{ backgroundColor: '#121212' }} className="w-full text-[#95c623] py-3 rounded-2xl font-black text-xs shadow-md">Guardar</button>
            </form>
          </div>
        </div>
      )}

      {editingEmpanadaPrice && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div style={{ backgroundColor: '#E8Edd6' }} className="w-full max-w-xs rounded-3xl p-6 relative text-center shadow-2xl border border-black/10">
            <button onClick={() => setEditingEmpanadaPrice(null)} className="absolute top-4 right-4 text-gray-500 hover:text-black"><X size={18} /></button>
            <div style={{ backgroundColor: '#95c623' }} className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-black shadow-sm"><Pencil size={22} /></div>
            <h3 className="font-black text-base text-black">
              Editar ({editingEmpanadaPrice.type === 'unit' ? 'Unidad' : editingEmpanadaPrice.type === 'half' ? '1/2 Docena' : 'Docena'})
            </h3>
            <p className="text-xs text-gray-600 mb-4">{editingEmpanadaPrice.product.name}</p>
            <form onSubmit={handleSaveEmpanadaPrice} className="space-y-3">
              <div className="relative">
                <span className="absolute left-4 top-3.5 font-black text-lg text-black">$</span>
                <input type="number" step="1" value={newEmpanadaPriceValue} onChange={(e) => setNewEmpanadaPriceValue(e.target.value)} className="w-full text-center text-2xl font-black p-3 pl-8 bg-white border-2 border-black rounded-2xl outline-none text-black shadow-inner" autoFocus />
              </div>
              <button type="submit" style={{ backgroundColor: '#121212' }} className="w-full text-[#95c623] py-3 rounded-2xl font-black text-xs shadow-md">Guardar Precio</button>
            </form>
          </div>
        </div>
      )}

      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-30">
          <button onClick={() => setIsCartOpen(true)} style={{ backgroundColor: '#95c623' }} className="w-full text-black py-3.5 px-5 rounded-2xl font-black text-xs flex justify-between items-center shadow-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-black text-[#95c623] w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black">{cart.length}</span>
              <span>Ver mi pedido</span>
            </div>
            <span className="text-sm font-black">${totalCartPrice}</span>
          </button>
        </div>
      )}

      {isInfoModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 max-h-[85vh] overflow-y-auto relative">
            <button onClick={() => setIsInfoModalOpen(false)} className="absolute top-4 right-4 bg-gray-100 p-1.5 rounded-full text-black"><X size={18} /></button>
            <div className="text-center space-y-2 mb-6">
              <div className="w-16 h-16 bg-[#121212] text-[#95c623] rounded-2xl flex items-center justify-center mx-auto text-xl font-black shadow-md">AP</div>
              <h2 className="text-2xl font-black text-gray-900">AL PASO</h2>
              <p className="text-xs text-gray-500 uppercase">Empanadería y Sandwichería</p>
            </div>
            <div className="space-y-4 text-xs border-t border-gray-100 pt-4">
              <div>
                <h3 className="font-extrabold text-gray-800 uppercase text-[10px] mb-1">Sobre Nosotros</h3>
                <p className="text-gray-600 leading-relaxed">Ofrecemos las mejores empanadas artesanales y sándwiches completos preparados en el momento.</p>
              </div>
              <div>
                <h3 className="font-extrabold text-gray-800 uppercase text-[10px] mb-2">Horarios</h3>
                <div className="bg-[#121212] p-3 rounded-2xl space-y-2 text-white font-medium text-[11px]">
                  <div className="flex justify-between border-b border-white/10 pb-1.5">
                    <span>Lunes a Sábado</span>
                    <span style={{ color: '#95c623' }} className="font-bold text-right">10:00 - 16:00<br />19:00 - 00:30</span>
                  </div>
                  <div className="flex justify-between pt-0.5">
                    <span>Domingos</span>
                    <span style={{ color: '#95c623' }} className="font-bold">10:00 - 16:00</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-extrabold text-gray-800 uppercase text-[10px] mb-2">Ubicación</h3>
                <div className="bg-gray-50 p-3.5 rounded-2xl space-y-3">
                  <div className="w-full h-36 bg-gray-200 rounded-xl overflow-hidden relative">
                    <iframe title="Mapa" src={IFRAME_SRC} width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy"></iframe>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-black shrink-0" />
                    <span className="text-xs font-bold text-black">{DIRECCION_REAL}</span>
                  </div>
                  <a href={MAPS_LINK} target="_blank" rel="noreferrer" className="block w-full text-center bg-[#121212] text-[#95c623] py-2.5 rounded-xl font-bold text-xs">
                    Abrir ubicación en Google Maps 📍
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedProduct && (() => {
        const { pUnit, pHalf, pDozen } = getEmpanadaPrices(selectedProduct);
        return (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[85vh] overflow-y-auto relative">
              <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 bg-gray-100 p-1.5 rounded-full text-black z-10"><X size={18} /></button>
              <div className="h-48 bg-gray-100 rounded-2xl overflow-hidden mb-4 relative">
                <img src={selectedProduct.image || 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=600&auto=format&fit=crop'} alt={selectedProduct.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex justify-between items-start gap-2 flex-wrap mb-1">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-black text-black">{selectedProduct.name}</h3>
                    {isSpecialEmpanada(selectedProduct) && (
                      <span className="bg-[#121212] text-[#95c623] text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Star size={9} className="fill-[#95c623]" /> ESPECIAL
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{selectedProduct.description || selectedProduct.category}</p>
                </div>
                {selectedProduct.category === 'Empanadas' && (
                  <div className="text-right shrink-0 pt-0.5">
                    <span className="text-lg font-black text-black block">${Math.round(pDozen)} doc.</span>
                  </div>
                )}
              </div>

              {selectedProduct.category === 'Empanadas' && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <p className="text-xs font-bold text-black mb-2">Sumar cantidad rápida:</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-50 p-2 rounded-2xl border border-gray-100 flex flex-col justify-between">
                      <button type="button" onClick={() => setProductQuantity(productQuantity + 1)} className="w-full py-2 px-1 bg-gray-100 hover:bg-[#95c623] hover:text-black rounded-xl text-xs font-bold text-black mb-1">+1 Unidad</button>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <span className="text-xs font-black text-black">${Math.round(pUnit)}</span>
                        {isAdmin && (
                          <button type="button" onClick={() => handleOpenEmpanadaPriceModal(selectedProduct, 'unit', pUnit)} className="p-1 bg-gray-200 hover:bg-black hover:text-[#95c623] rounded-full text-gray-700" title="Editar">
                            <Pencil size={10} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-2xl border border-gray-100 flex flex-col justify-between">
                      <button type="button" onClick={() => setProductQuantity(productQuantity + 6)} className="w-full py-2 px-1 bg-gray-100 hover:bg-[#95c623] hover:text-black rounded-xl text-xs font-bold text-black mb-1">+1/2 Docena</button>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <span className="text-xs font-black text-black">${Math.round(pHalf)}</span>
                        {isAdmin && (
                          <button type="button" onClick={() => handleOpenEmpanadaPriceModal(selectedProduct, 'half', pHalf)} className="p-1 bg-gray-200 hover:bg-black hover:text-[#95c623] rounded-full text-gray-700" title="Editar">
                            <Pencil size={10} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-2xl border border-gray-100 flex flex-col justify-between">
                      <button type="button" onClick={() => setProductQuantity(productQuantity + 12)} className="w-full py-2 px-1 bg-gray-100 hover:bg-[#95c623] hover:text-black rounded-xl text-xs font-bold text-black mb-1">+1 Docena</button>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <span className="text-xs font-black text-black">${Math.round(pDozen)}</span>
                        {isAdmin && (
                          <button type="button" onClick={() => handleOpenEmpanadaPriceModal(selectedProduct, 'dozen', pDozen)} className="p-1 bg-gray-200 hover:bg-black hover:text-[#95c623] rounded-full text-gray-700" title="Editar">
                            <Pencil size={10} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(selectedProduct.category === 'Sandwiches' || selectedProduct.category === 'Hamburguesas') && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <label className="block text-xs font-bold text-black mb-1.5">Aderezos y verduras adicionales:</label>
                  <textarea rows="2" placeholder="Ej: Con mayo, sin cebolla..." value={productNotes} onChange={(e) => setProductNotes(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none text-black" />
                </div>
              )}

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3 bg-gray-100 px-3 py-2 rounded-xl">
                  <button type="button" onClick={() => setProductQuantity(Math.max(0, productQuantity - 1))} className="p-1 font-bold text-black"><Minus size={14} /></button>
                  <span className="font-extrabold text-sm min-w-[20px] text-center text-black">{productQuantity}</span>
                  <button type="button" onClick={() => setProductQuantity(productQuantity + 1)} className="p-1 font-bold text-black"><Plus size={14} /></button>
                </div>
                <button type="button" onClick={addToCart} disabled={productQuantity === 0} style={{ backgroundColor: productQuantity > 0 ? '#95c623' : '#E5E7EB' }} className={`px-6 py-3 rounded-2xl font-black text-xs flex gap-2 ${productQuantity > 0 ? 'text-black shadow-md' : 'text-gray-400 cursor-not-allowed'}`}>
                  <span>Añadir</span>
                  <span>${calculateTotalPrice(selectedProduct, productQuantity)}</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {isCartOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[85vh] overflow-y-auto relative">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="font-black text-base text-black">Tu Pedido</h3>
              <button onClick={() => setIsCartOpen(false)} className="p-1 text-gray-400"><X size={20} /></button>
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
                    <button onClick={() => removeFromCart(item.cartId)} className="text-red-500 p-1"><X size={16} /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="pt-3 border-t flex justify-between items-center font-black text-sm mb-4 text-black">
              <span>Total</span>
              <span>${totalCartPrice}</span>
            </div>
            <button onClick={handleSendWhatsApp} style={{ backgroundColor: '#95c623' }} className="w-full text-black py-3 rounded-2xl font-black text-xs shadow-md">
              Continuar con el pedido en WhatsApp
            </button>
          </div>
        </div>
      )}

      {isPinModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div style={{ backgroundColor: '#E8Edd6' }} className="w-full max-w-xs rounded-3xl p-6 relative text-center shadow-2xl border border-black/10">
            <button onClick={() => { setIsPinModalOpen(false); setPinError(''); setPin(''); }} className="absolute top-4 right-4 text-gray-500"><X size={18} /></button>
            <div style={{ backgroundColor: '#95c623' }} className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-black shadow-sm"><Lock size={22} /></div>
            <h3 className="font-black text-base text-black">Acceso Administrador</h3>
            <p className="text-xs text-gray-600 mb-4">Ingresa tu clave de dueño</p>
            <form onSubmit={handlePinSubmit} className="space-y-3">
              <input type="password" inputMode="numeric" pattern="[0-9]*" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value)} placeholder="****" className="w-full text-center text-2xl font-black p-3 bg-white border-2 border-black rounded-2xl outline-none text-black tracking-widest shadow-inner" autoFocus />
              {pinError && <p className="text-xs text-red-600 font-bold">{pinError}</p>}
              <button type="submit" style={{ backgroundColor: '#121212' }} className="w-full text-[#95c623] py-3 rounded-2xl font-black text-xs shadow-md">Ingresar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}