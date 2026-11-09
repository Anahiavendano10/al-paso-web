import React, { useState, useEffect } from 'react';
import {
  Lock, LogOut, Search, ShoppingCart, Plus, Minus, X,
  MapPin, Settings, Power, Menu, Instagram, Facebook, Star, RefreshCw, Pencil
} from 'lucide-react';
import { supabase } from './supabase';
import CartDrawer from './components/CartDrawer';
const ADMIN_UID = 'e2452754-e0dc-4f72-89d5-b686322f2f83';

// Calcula promociones combinando todas las empanadas del carrito.
// Se elige automaticamente la combinacion de packs mas economica.
const calculateEmpanadaComboTotal = (traditionalCount, specialCount) => {
  const traditional = Math.max(0, Math.floor(traditionalCount));
  const special = Math.max(0, Math.floor(specialCount));
  const memo = new Map();
  const packs = [12, 6, 3, 1];

  const solve = (t, e) => {
    if (t === 0 && e === 0) return 0;
    const key = `${t}:${e}`;
    if (memo.has(key)) return memo.get(key);
    let best = Infinity;
    // Primero se forman todas las docenas posibles, luego medias docenas,
    // luego ternas y finalmente unidades sueltas.
    const size = packs.find(pack => pack <= t + e);
    {
      const minSpecial = Math.max(0, size - t);
      const maxSpecial = Math.min(size, e);
      for (let specialsInPack = minSpecial; specialsInPack <= maxSpecial; specialsInPack++) {
        const traditionalInPack = size - specialsInPack;
        let packPrice;
        if (size === 12) packPrice = specialsInPack === 0 ? 14000 : (specialsInPack <= 6 ? 15000 : 16000);
        else if (size === 6) packPrice = specialsInPack === 0 ? 7000 : 8000;
        else if (size === 3) packPrice = specialsInPack === 0 ? 3500 : 4000;
        else packPrice = 1500;
        best = Math.min(best, packPrice + solve(t - traditionalInPack, e - specialsInPack));
      }
    }
    memo.set(key, best);
    return best;
  };
  return solve(traditional, special);
};

const isEmpanada = (item) => item?.category === 'Empanadas';

const calculateCartTotal = (items) => {
  let traditional = 0;
  let special = 0;
  let otherTotal = 0;
  for (const item of items) {
    if (isEmpanada(item)) {
      if (item.is_featured === true) special += Number(item.quantity) || 0;
      else traditional += Number(item.quantity) || 0;
    } else {
      otherTotal += Number(item.totalPrice) || 0;
    }
  }
  return otherTotal + calculateEmpanadaComboTotal(traditional, special);
};


export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);
  const [newPrice, setNewPrice] = useState('');

  const [editingEmpanadaPrice, setEditingEmpanadaPrice] = useState(null);
  const [newEmpanadaPriceValue, setNewEmpanadaPriceValue] = useState('');

  const [isOpenLocal, setIsOpenLocal] = useState(true);
  const [isDeliveryAvailable, setIsDeliveryAvailable] = useState(false);
  const [isRetiroAvailable, setIsRetiroAvailable] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('alpaso_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });
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
    fetchBusinessSettings();

    const checkAdminSession = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (!error) {
        setIsAdmin(user?.id === ADMIN_UID);
      }
    };

    checkAdminSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsAdmin(session?.user?.id === ADMIN_UID);
      }
    );

    const businessSettingsChannel = supabase
      .channel('business-settings-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'business_settings',
          filter: 'id=eq.1'
        },
        (payload) => {
          const updated = payload.new;

          setIsOpenLocal(updated.is_open);
          setIsDeliveryAvailable(updated.delivery_available);
          setIsRetiroAvailable(updated.pickup_available);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(businessSettingsChannel);
    };
  }, []);


  useEffect(() => {
    localStorage.setItem('alpaso_cart', JSON.stringify(cart));
  }, [cart]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*');
    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  };


  const fetchBusinessSettings = async () => {
    const { data, error } = await supabase
      .from('business_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      console.error('Error al cargar configuración:', error);
      return;
    }

    setIsOpenLocal(data.is_open);
    setIsDeliveryAvailable(data.delivery_available);
    setIsRetiroAvailable(data.pickup_available);
  };

  const saveBusinessSetting = async (field, value) => {
    if (!isAdmin) return;

    const { data, error } = await supabase
      .from('business_settings')
      .update({
        [field]: value,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1)
      .select('id')
      .maybeSingle();

    if (error || !data) {
      console.error('Error al guardar configuración:', error);
      alert('No se pudo guardar el cambio. Intentá nuevamente.');
      await fetchBusinessSettings();
      return;
    }

    if (field === 'is_open') {
      setIsOpenLocal(value);
    }

    if (field === 'delivery_available') {
      setIsDeliveryAvailable(value);
    }

    if (field === 'pickup_available') {
      setIsRetiroAvailable(value);
    }
  };


  const handlePinSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: adminEmail.trim(),
        password: adminPassword,
      });

      if (error) {
        setLoginError('Correo o contraseña incorrectos');
        return;
      }

      if (data.user?.id !== ADMIN_UID) {
        await supabase.auth.signOut();
        setLoginError('Esta cuenta no tiene permisos de administrador');
        return;
      }

      setAdminPassword('');
      setIsPinModalOpen(false);
    } catch {
      setLoginError('No se pudo iniciar sesión. Intentá nuevamente.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error al cerrar sesión:', error);
      return;
    }

    setIsAdmin(false);
    setAdminEmail('');
    setAdminPassword('');
    setLoginError('');
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
    if (!isAdmin && p.visible === false) return false;
    const matchesSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedCategory === 'Todos') return matchesSearch;

    const catNormalized = (p.category || '').toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Quita tildes ej: sándwiches -> sandwiches

    const selectedNormalized = selectedCategory.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const matchesCat = catNormalized.includes(selectedNormalized.split(' ')[0]);

    return matchesSearch && matchesCat;
  });

  const isSpecialEmpanada = (item) => {
    if (!item) return false;
    return item.is_featured === true;
  };

  const openProductDetail = (prod) => {
    if (!prod.available || prod.visible === false) return;
    setSelectedProduct(prod);

    const qtyInicial = (prod.category === 'Empanadas' || prod.category === 'Promos') ? 0 : 1;
    setProductQuantity(qtyInicial);
    setProductNotes('');
  };

  const getEmpanadaPrices = (prod) => {
    const isEspecial = isSpecialEmpanada(prod);
    const pUnit = (prod.price_unit !== null && prod.price_unit !== undefined) ? Number(prod.price_unit) : (prod.price || 1500);
    const pHalf = (prod.price_half !== null && prod.price_half !== undefined) ? Number(prod.price_half) : (isEspecial ? 8000 : 7000);
    const pDozen = (prod.price_dozen !== null && prod.price_dozen !== undefined) ? Number(prod.price_dozen) : (isEspecial ? 16000 : 14000);
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
    if (!selectedProduct || !selectedProduct.available || selectedProduct.visible === false || productQuantity <= 0) return;

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

  const totalCartPrice = calculateCartTotal(cart);
  // El importe mostrado por cada sabor es su aporte incremental al pedido.
  // De este modo el desglose y el total del carrito siempre coinciden.
  const cartWithComboPrices = cart.map((item, index) => ({
    ...item,
    totalPrice: isEmpanada(item)
      ? calculateCartTotal(cart.slice(0, index + 1)) - calculateCartTotal(cart.slice(0, index))
      : item.totalPrice
  }));

  const toggleAvailable = async (id, currentStatus) => {
    const nextStatus = !currentStatus;
    setProducts(products.map(p => p.id === id ? { ...p, available: nextStatus } : p));

    const { error } = await supabase.from('products').update({ available: nextStatus }).eq('id', id);
    if (error) {
      console.error("Error al actualizar disponible en Supabase:", error);
      fetchProducts();
    }
  };

  const toggleVisible = async (id, currentVisible) => {
    if (!isAdmin) return;
    const nextVisible = currentVisible === false;
    const { data, error } = await supabase.from('products')
      .update({ visible: nextVisible }).eq('id', id).select('id').maybeSingle();
    if (error || !data) {
      console.error('Error al actualizar visibilidad:', error);
      alert('No se pudo guardar la visibilidad. Intentá nuevamente.');
      await fetchProducts();
      return;
    }
    setProducts(prev => prev.map(p => p.id === id ? { ...p, visible: nextVisible } : p));
    if (!nextVisible && selectedProduct?.id === id) setSelectedProduct(null);
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

    const { error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', product.id);

    if (error) {
      console.error("Error al actualizar precio libre de empanada en Supabase:", error);
    } else {
      await fetchProducts();
      if (selectedProduct && selectedProduct.id === product.id) {
        const updatedProd = { ...product, ...updateData };
        setSelectedProduct(updatedProd);
      }
    }

    setEditingEmpanadaPrice(null);
  };

  const handleSendWhatsApp = async () => {
    if (cart.length === 0 || checkoutLoading) return;
    setCheckoutLoading(true);
    try {
      // Consultar el estado actual, incluso si el carrito fue guardado días atrás.
      const { data, error } = await supabase.from('products')
        .select('id, name, available, visible')
        .in('id', [...new Set(cart.map(item => item.id))]);
      if (error || !data) {
        alert('No pudimos verificar los productos. Intentá nuevamente.');
        return;
      }
      const byId = new Map(data.map(p => [String(p.id), p]));
      const unavailable = cart.filter(item => {
        const current = byId.get(String(item.id));
        return !current || current.available !== true || current.visible === false;
      });
      if (unavailable.length) {
        alert('Estos productos ya no están disponibles: ' + unavailable.map(p => p.name).join(', ') + '. Quitalos del carrito para continuar.');
        await fetchProducts();
        return;
      }
      let message = `*¡Hola AL PASO! Quiero realizar el siguiente pedido:*\n\n`;
      cart.forEach(item => {
        message += `• *${item.name}* (x${item.quantity})\n`;
        if (item.notes) message += `   _Detalle: ${item.notes}_\n`;
      });
      const empanadaQuantity = cart.filter(isEmpanada).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
      if (empanadaQuantity > 0) {
        const empanadaTotal = calculateCartTotal(cart.filter(isEmpanada));
        message += `\n*Empanadas (${empanadaQuantity}) con promociones combinadas: $${empanadaTotal}*\n`;
      }
      message += `\n*Total a pagar: $${totalCartPrice}*`;
      message += `\n\nQuedo a la espera de la confirmación. ¡Muchas gracias!`;
      window.open(`https://wa.me/${PHONE_NUMBER.replace('+', '')}?text=${encodeURIComponent(message)}`, '_blank');
    } finally {
      setCheckoutLoading(false);
    }
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

      <div className="max-w-md md:max-w-3xl mx-auto px-3 mt-3 space-y-4">
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
              <button onClick={() => saveBusinessSetting('is_open', !isOpenLocal)} className={`px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1 ${isOpenLocal ? 'bg-black text-white' : 'bg-red-600 text-white'}`}>
                <Power size={12} /> {isOpenLocal ? 'ABIERTO' : 'CERRADO'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button onClick={() => saveBusinessSetting('pickup_available', !isRetiroAvailable)} className={`py-2 px-3 rounded-xl text-xs font-extrabold border ${isRetiroAvailable ? 'bg-green-100 border-green-500 text-green-900' : 'bg-red-50 border-red-300 text-red-700'}`}>
                🛍️ Retiro: {isRetiroAvailable ? 'Disponible' : 'No'}
              </button>
              <button onClick={() => saveBusinessSetting('delivery_available', !isDeliveryAvailable)} className={`py-2 px-3 rounded-xl text-xs font-extrabold border ${isDeliveryAvailable ? 'bg-green-100 border-green-500 text-green-900' : 'bg-red-50 border-red-300 text-red-700'}`}>
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

        {/* LISTA DE PRODUCTOS EN DOS COLUMNAS */}
        <div className="grid grid-cols-2 gap-3 pt-1">
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
                <div key={item.id} onClick={() => openProductDetail(item)} className={`bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between ${item.available && item.visible !== false ? 'cursor-pointer hover:shadow-md transition-all active:scale-[0.99]' : 'opacity-60'}`}>
                  <div className="h-32 w-full bg-gray-100 relative">
                    <img src={item.image || 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=600&auto=format&fit=crop'} alt={item.name} className="w-full h-full object-cover" />
                    {especial && (
                      <span className="absolute top-2 left-2 bg-[#121212]/90 text-[#95c623] text-[8px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 uppercase">
                        <Star size={8} className="fill-[#95c623]" /> DESTACADO
                      </span>
                    )}
                    {isAdmin && item.visible === false && (
                      <span className="absolute bottom-2 right-2 bg-gray-900 text-white text-[8px] font-black px-2 py-1 rounded-full">OCULTO</span>
                    )}
                    {!item.available && (
                      <span className="absolute top-2 right-2 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase">AGOTADO</span>
                    )}
                  </div>
                  <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-xs text-black line-clamp-1">{item.name}</h3>
                      <p className="text-[10px] text-gray-500 line-clamp-1">{item.description || item.category}</p>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1">
                        {item.category === 'Empanadas' ? (
                          <div>
                            <span className="text-xs font-black text-black">${Math.round(pDozen)}</span>
                            <span className="text-[9px] text-gray-400 font-bold">doc.</span>
                          </div>
                        ) : (
                          <span className="text-xs font-black text-black">${Math.round(item.price || 0)}</span>
                        )}
                        {isAdmin && item.category !== 'Empanadas' && (
                          <button type="button" onClick={(e) => { e.stopPropagation(); handleOpenPriceModal(item); }} className="p-1 bg-gray-100 hover:bg-black hover:text-[#95c623] text-gray-700 rounded-full" title="Editar precio">
                            <Pencil size={10} />
                          </button>
                        )}
                      </div>
                      <button type="button" style={{ backgroundColor: '#95c623' }} className="text-black font-extrabold text-[10px] px-2.5 py-1.5 rounded-xl shadow-xs">
                        + Agregar
                      </button>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="px-3 pb-3 border-t border-gray-100 pt-2 grid grid-cols-3 gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button type="button" onClick={() => toggleAvailable(item.id, item.available)} className={`w-full py-1.5 px-1 rounded-full text-[10px] font-black text-white ${item.available ? 'bg-red-500' : 'bg-gray-800'}`}>
                        {item.available ? 'Agotar' : 'Activar'}
                      </button>
                      <button type="button" onClick={() => toggleVisible(item.id, item.visible)} className={`w-full py-1.5 px-1 rounded-full text-[10px] font-black ${item.visible === false ? 'bg-green-700 text-white' : 'bg-slate-700 text-white'}`}>
                        {item.visible === false ? 'Mostrar' : 'Ocultar'}
                      </button>
                      <button type="button" onClick={() => toggleFeatured(item.id, item.is_featured)} className={`w-full py-1.5 px-1 rounded-full text-[10px] font-black flex items-center justify-center gap-0.5 ${item.is_featured === true ? 'bg-amber-400 text-black border border-amber-500' : 'bg-amber-100/80 text-amber-900 border border-amber-300'}`}>
                        <Star size={10} className={item.is_featured === true ? 'fill-black' : ''} />
                        {item.is_featured === true ? 'Dest.' : 'Destacar'}
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

      <CartDrawer
        cart={cartWithComboPrices}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onRemove={removeFromCart}
        onCheckout={handleSendWhatsApp}
        totalPrice={totalCartPrice}
      />


      {isPinModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div
            style={{ backgroundColor: '#E8Edd6' }}
            className="w-full max-w-xs rounded-3xl p-6 relative text-center shadow-2xl border border-black/10"
          >
            <button
              type="button"
              onClick={() => {
                setIsPinModalOpen(false);
                setLoginError('');
                setAdminPassword('');
              }}
              className="absolute top-4 right-4 text-gray-500"
            >
              <X size={18} />
            </button>

            <div
              style={{ backgroundColor: '#95c623' }}
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-black"
            >
              <Lock size={22} />
            </div>

            <h3 className="font-black text-base text-black">
              Acceso Administrador
            </h3>

            <p className="text-xs text-gray-600 mb-4">
              Ingresá con tu cuenta de AL PASO
            </p>

            <form onSubmit={handlePinSubmit} className="space-y-3">
              <input
                type="email"
                placeholder="Correo electrónico"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
                className="w-full p-3 bg-white border-2 border-black rounded-2xl text-sm text-black outline-none"
              />

              <input
                type="password"
                placeholder="Contraseña"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
                className="w-full p-3 bg-white border-2 border-black rounded-2xl text-sm text-black outline-none"
              />

              {loginError && (
                <p className="text-xs text-red-600 font-bold">
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                style={{ backgroundColor: '#121212' }}
                className="w-full text-[#95c623] py-3 rounded-2xl font-black text-xs disabled:opacity-50"
              >
                {loginLoading ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}