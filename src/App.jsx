import React, { useState, useMemo, useEffect } from 'react';
import {
  Menu,
  ShoppingBag,
  Search,
  X,
  MapPin,
  Clock,
  Phone,
  Instagram,
  Facebook,
  ChevronRight,
  Plus,
  Minus,
  Trash2,
  Settings,
  Edit2,
  Tag,
  Info
} from 'lucide-react';
import { supabase } from './supabase';

// --- CONFIGURACIÓN E INFORMACIÓN DE AL PASO ---
const INITIAL_BUSINESS_INFO = {
  name: "AL PASO",
  subtitle: "Empanadería y Sándwichería",
  address: "Av. Corrientes 1234, Buenos Aires",
  isOpen: true,
  deliveryAvailable: true,
  pickupAvailable: true,
  phone: "+5491123456789",
  whatsapp: "5491123456789",
  about: "¡Las mejores empanadas artesanales y sándwiches gourmet! Masa 100% casera, rellenos abundantes y cocción al instante.",
  bannerImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
  logoImage: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=300&q=80",
  hours: [
    { day: "Lunes", hours: "11:00 - 23:00" },
    { day: "Martes", hours: "11:00 - 23:00" },
    { day: "Miércoles", hours: "11:00 - 23:00" },
    { day: "Jueves", hours: "11:00 - 23:30" },
    { day: "Viernes", hours: "11:00 - 01:00" },
    { day: "Sábado", hours: "12:00 - 01:00" },
    { day: "Domingo", hours: "12:00 - 22:30" }
  ]
};

const CATEGORIES = [
  { id: "all", name: "Todos", icon: "🍽️" },
  { id: "empanadas", name: "Empanadas", icon: "🥟" },
  { id: "sandwiches", name: "Sándwiches", icon: "🥪" },
  { id: "promos", name: "Promos", icon: "🔥" },
  { id: "bebidas", name: "Bebidas", icon: "🥤" }
];

export default function App() {
  const [business, setBusiness] = useState(INITIAL_BUSINESS_INFO);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const [cart, setCart] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');

  const [productQuantity, setProductQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  const [editingProduct, setEditingProduct] = useState(null);

  // --- CONEXIÓN A SUPABASE (BASE DE DATOS EN TIEMPO REAL) ---
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('products').select('*');
      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    };

    fetchProducts();

    const channel = supabase
      .channel('realtime-products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // --- FILTRADO DE PRODUCTOS ---
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // --- MODAL DE DETALLE DE PRODUCTO ---
  const handleOpenProduct = (product) => {
    setSelectedProduct(product);
    setProductQuantity(1);
    setSelectedOption(product.mandatoryOptions?.options ? product.mandatoryOptions.options[0].name : null);
    setSelectedExtras([]);
    setSpecialInstructions('');
  };

  const handleToggleExtra = (extra) => {
    if (selectedExtras.some(e => e.name === extra.name)) {
      setSelectedExtras(selectedExtras.filter(e => e.name !== extra.name));
    } else {
      setSelectedExtras([...selectedExtras, extra]);
    }
  };

  const currentModalUnitPrice = useMemo(() => {
    if (!selectedProduct) return 0;
    let total = selectedProduct.price;
    if (selectedExtras.length > 0) {
      total += selectedExtras.reduce((sum, e) => sum + e.price, 0);
    }
    return total;
  }, [selectedProduct, selectedExtras]);

  // --- MANEJO DEL CARRITO ---
  const handleAddToCart = () => {
    if (!selectedProduct) return;

    const cartItem = {
      cartItemId: Date.now() + Math.random(),
      productId: selectedProduct.id,
      name: selectedProduct.name,
      image: selectedProduct.image,
      basePrice: selectedProduct.price,
      quantity: productQuantity,
      selectedOption: selectedOption,
      selectedExtras: selectedExtras,
      specialInstructions: specialInstructions,
      unitPrice: currentModalUnitPrice,
      totalPrice: currentModalUnitPrice * productQuantity
    };

    setCart([...cart, cartItem]);
    setSelectedProduct(null);
  };

  const updateCartQty = (cartItemId, delta) => {
    setCart(cart.map(item => {
      if (item.cartItemId === cartItemId) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return null;
        return {
          ...item,
          quantity: newQty,
          totalPrice: item.unitPrice * newQty
        };
      }
      return item;
    }).filter(Boolean));
  };

  const removeCartItem = (cartItemId) => {
    setCart(cart.filter(item => item.cartItemId !== cartItemId));
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'ALPASO10') {
      setAppliedDiscount(0.10);
      setCouponError('');
    } else if (couponCode.toUpperCase() === 'PROMO20') {
      setAppliedDiscount(0.20);
      setCouponError('');
    } else {
      setCouponError('Código no válido. Prueba ALPASO10');
    }
  };

  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [cart]);

  const discountAmount = Math.round(cartSubtotal * appliedDiscount);
  const cartFinalTotal = cartSubtotal - discountAmount;
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // --- ENVÍO DE PEDIDO A WHATSAPP ---
  const handleSendWhatsAppOrder = () => {
    if (cart.length === 0) return;

    let text = `*NUEVO PEDIDO - ${business.name.toUpperCase()}*\n`;
    text += `------------------------------------\n`;

    cart.forEach((item) => {
      text += `*${item.quantity}x ${item.name}* - $${item.totalPrice.toLocaleString('es-AR')}\n`;
      if (item.selectedOption) {
        text += `  • Opción: ${item.selectedOption}\n`;
      }
      if (item.selectedExtras && item.selectedExtras.length > 0) {
        text += `  • Extras: ${item.selectedExtras.map(e => e.name).join(', ')}\n`;
      }
      if (item.specialInstructions) {
        text += `  • Notas: "${item.specialInstructions}"\n`;
      }
      text += `\n`;
    });

    text += `------------------------------------\n`;
    if (discountAmount > 0) {
      text += `Subtotal: $${cartSubtotal.toLocaleString('es-AR')}\n`;
      text += `Descuento (${appliedDiscount * 100}%): -$${discountAmount.toLocaleString('es-AR')}\n`;
    }
    text += `*TOTAL A PAGAR: $${cartFinalTotal.toLocaleString('es-AR')}*\n\n`;
    text += `📍 Dirección de entrega / Retiro en local\n`;
    text += `Por favor confirmen el pedido. ¡Muchas gracias!`;

    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/${business.whatsapp}?text=${encodedText}`, '_blank');
  };

  // --- ACCIONES ADMIN EN SUPABASE ---
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (editingProduct.id) {
      await supabase
        .from('products')
        .update({
          name: editingProduct.name,
          description: editingProduct.description,
          price: Number(editingProduct.price),
          categoryId: editingProduct.categoryId,
          image: editingProduct.image
        })
        .eq('id', editingProduct.id);
    } else {
      await supabase
        .from('products')
        .insert([{
          name: editingProduct.name,
          description: editingProduct.description,
          price: Number(editingProduct.price),
          categoryId: editingProduct.categoryId,
          image: editingProduct.image || 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80'
        }]);
    }
    setEditingProduct(null);
  };

  const handleDeleteProduct = async (id) => {
    await supabase.from('products').delete().eq('id', id);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex justify-center">
      {/* Contenedor Principal */}
      <div className="w-full max-w-md bg-white min-h-screen shadow-xl relative flex flex-col pb-24 border-x border-slate-200">
        
        {/* ================= ENCABEZADO (HEADER) ================= */}
        <header className="sticky top-0 z-30 bg-white text-slate-900 border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
          <button 
            onClick={() => setIsInfoOpen(true)}
            className="p-2 text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            title="Ver información"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setIsInfoOpen(true)}>
            <span className="text-xl font-black tracking-widest text-black">
              AL PASO
            </span>
            <span className="w-2.5 h-2.5 bg-lime-500 rounded-full shadow-sm" />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsAdminOpen(true)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              title="Panel Administrador"
            >
              <Settings className="w-5 h-5" />
            </button>

            <button 
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-full transition-colors relative"
            >
              <ShoppingBag className="w-6 h-6" />
              {totalItemsCount > 0 && (
                <span className="absolute top-1 right-1 bg-lime-500 text-black font-black text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow">
                  {totalItemsCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* ================= TARJETA PRINCIPAL (HERO) ================= */}
        <section className="p-4">
          <div className="relative rounded-3xl overflow-hidden shadow-sm border border-slate-200 bg-slate-900 group">
            <div className="h-44 w-full relative">
              <img 
                src={business.bannerImage} 
                alt="Banner Al Paso" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            </div>

            <div className="bg-white text-slate-900 mx-3 -mt-10 relative z-10 rounded-2xl p-4 shadow-lg border border-slate-200">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h1 className="text-2xl font-black tracking-wide text-black">{business.name}</h1>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{business.subtitle}</p>
                </div>
                <button 
                  onClick={() => setIsInfoOpen(true)}
                  className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <Info className="w-5 h-5 text-lime-600" />
                </button>
              </div>

              <div className="flex items-center text-xs text-slate-600 mt-2 gap-1.5 font-medium">
                <MapPin className="w-4 h-4 text-lime-600 shrink-0" />
                <span className="truncate">{business.address}</span>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${business.isOpen ? 'bg-lime-500 animate-pulse' : 'bg-red-500'}`} />
                  <span className="font-extrabold text-slate-800">
                    {business.isOpen ? 'Abierto' : 'Cerrado'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 font-bold text-[11px]">
                  {business.deliveryAvailable && (
                    <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md border border-slate-200">
                      🛵 Delivery
                    </span>
                  )}
                  {business.pickupAvailable && (
                    <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md border border-slate-200">
                      🛍️ Retiro
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= BUSCADOR Y CATEGORÍAS ================= */}
        <section className="px-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Buscar empanadas, sándwiches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs pl-10 pr-4 py-3 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-500 font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                    isActive 
                      ? 'bg-lime-500 text-black shadow-sm font-black' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ================= MENÚ DE PRODUCTOS ================= */}
        <section className="px-4 mt-4 space-y-3 flex-1">
          {loading ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-xs font-bold">Cargando menú de AL PASO...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm font-bold">No se encontraron productos</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => handleOpenProduct(product)}
                className="bg-white rounded-2xl p-3 border border-slate-200 hover:border-lime-500 shadow-sm transition-all cursor-pointer flex gap-3 items-center group"
              >
                <div className="flex-1 space-y-1">
                  <h3 className="font-bold text-black text-sm leading-snug">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                    {product.description}
                  </p>
                  <div className="pt-1 font-black text-slate-900 text-base">
                    ${product.price?.toLocaleString('es-AR')}
                  </div>
                </div>

                <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative border border-slate-100">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                  <div className="absolute bottom-1 right-1 bg-lime-500 text-black p-1 rounded-full shadow">
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
              </div>
            ))
          )}
        </section>

        {/* ================= PIE DE PÁGINA (FOOTER) ================= */}
        <footer className="mt-8 px-4 py-6 bg-slate-900 text-white text-center space-y-2 border-t border-slate-800">
          <div className="w-12 h-12 bg-lime-500 text-black font-black rounded-full mx-auto flex items-center justify-center text-lg shadow">
            AP
          </div>
          <p className="font-black text-white text-base tracking-wide">{business.name}</p>
          <p className="text-xs font-medium text-slate-400">{business.address}</p>
          <div className="flex justify-center gap-4 pt-2 text-slate-300">
            <Instagram className="w-5 h-5 cursor-pointer hover:text-lime-500 transition-colors" />
            <Facebook className="w-5 h-5 cursor-pointer hover:text-lime-500 transition-colors" />
            <Phone className="w-5 h-5 cursor-pointer hover:text-lime-500 transition-colors" />
          </div>
          <p className="text-[10px] text-slate-500 pt-2">© 2026 AL PASO. Todos los derechos reservados.</p>
        </footer>

        {/* ================= BARRA FLOTANTE DEL CARRITO ================= */}
        {cart.length > 0 && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-20">
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-lime-500 text-black py-3.5 px-5 rounded-2xl shadow-xl flex items-center justify-between font-black text-sm transition-all transform active:scale-95"
            >
              <div className="flex items-center gap-2">
                <span className="bg-black text-lime-400 px-2 py-0.5 rounded-lg text-xs font-black">
                  {totalItemsCount}
                </span>
                <span>Ver mi pedido</span>
              </div>
              <span className="text-base">${cartFinalTotal.toLocaleString('es-AR')}</span>
            </button>
          </div>
        )}

        {/* ================= MODAL DETALLE DE PRODUCTO ================= */}
        {selectedProduct && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4">
            <div className="bg-white text-slate-900 w-full max-w-md max-h-[90vh] rounded-t-3xl sm:rounded-3xl overflow-y-auto flex flex-col shadow-2xl border border-slate-200">
              
              <div className="relative h-56 w-full shrink-0">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover" 
                />
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-3 right-3 bg-black/70 text-white p-2 rounded-full shadow hover:bg-black transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-5 flex-1">
                <div>
                  <h2 className="text-xl font-black text-black">{selectedProduct.name}</h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                    {selectedProduct.description}
                  </p>
                </div>

                {selectedProduct.mandatoryOptions && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                        {selectedProduct.mandatoryOptions.title}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                        Obligatorio
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {selectedProduct.mandatoryOptions.options.map((opt) => (
                        <label 
                          key={opt.name}
                          onClick={() => setSelectedOption(opt.name)}
                          className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            selectedOption === opt.name 
                              ? 'border-lime-500 bg-lime-50 text-black font-bold' 
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input 
                              type="radio" 
                              name="mandatory" 
                              checked={selectedOption === opt.name}
                              onChange={() => setSelectedOption(opt.name)}
                              className="accent-lime-600"
                            />
                            <span>{opt.name}</span>
                          </div>
                          {opt.price > 0 && <span className="font-bold">+${opt.price}</span>}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProduct.extras && selectedProduct.extras.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                        Agrega Adicionales
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                        Opcional
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {selectedProduct.extras.map((extra) => {
                        const isChecked = selectedExtras.some(e => e.name === extra.name);
                        return (
                          <label 
                            key={extra.name}
                            onClick={() => handleToggleExtra(extra)}
                            className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                              isChecked 
                                ? 'border-lime-500 bg-lime-50 text-black font-bold' 
                                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input 
                                type="checkbox" 
                                checked={isChecked}
                                onChange={() => {}}
                                className="accent-lime-600 rounded"
                              />
                              <span>{extra.name}</span>
                            </div>
                            <span className="font-bold">+${extra.price}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                    Notas Especiales
                  </label>
                  <input 
                    type="text"
                    placeholder="Ej: Sin cebolla, extra salsa..."
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="w-full bg-slate-50 text-xs p-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-lime-500 font-medium"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-3">
                <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shrink-0">
                  <button 
                    onClick={() => setProductQuantity(Math.max(1, productQuantity - 1))}
                    className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg font-bold"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center text-sm font-black text-black">
                    {productQuantity}
                  </span>
                  <button 
                    onClick={() => setProductQuantity(productQuantity + 1)}
                    className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg font-bold"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-lime-500 hover:bg-lime-600 text-black py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-between transition-colors shadow-md"
                >
                  <span>Añadir</span>
                  <span>${(currentModalUnitPrice * productQuantity).toLocaleString('es-AR')}</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ================= MODAL CARRITO ================= */}
        {isCartOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4">
            <div className="bg-white text-slate-900 w-full max-w-md max-h-[90vh] rounded-t-3xl sm:rounded-3xl overflow-y-auto flex flex-col shadow-2xl border border-slate-200">
              
              <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-lime-600" />
                  <h2 className="font-black text-black text-lg">Tu Pedido</h2>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 text-slate-500 hover:bg-slate-100 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-4 flex-1 space-y-3 overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 space-y-2">
                    <ShoppingBag className="w-12 h-12 mx-auto stroke-1" />
                    <p className="text-base font-bold text-slate-600">Tu carrito está vacío</p>
                    <p className="text-xs">¡Elige tus empanadas y sándwiches!</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.cartItemId} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex gap-3">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-16 h-16 rounded-lg object-cover shrink-0 border border-slate-200"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-black text-xs">{item.name}</h4>
                          <button 
                            onClick={() => removeCartItem(item.cartItemId)}
                            className="text-slate-400 hover:text-red-500 p-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {item.selectedOption && (
                          <p className="text-[11px] text-slate-500">• {item.selectedOption}</p>
                        )}
                        {item.selectedExtras && item.selectedExtras.length > 0 && (
                          <p className="text-[11px] text-slate-500">
                            • Extras: {item.selectedExtras.map(e => e.name).join(', ')}
                          </p>
                        )}
                        {item.specialInstructions && (
                          <p className="text-[10px] text-slate-500 italic">"{item.specialInstructions}"</p>
                        )}

                        <div className="flex justify-between items-center pt-1">
                          <span className="font-black text-xs text-black">
                            ${item.totalPrice.toLocaleString('es-AR')}
                          </span>

                          <div className="flex items-center bg-white border border-slate-200 rounded-lg">
                            <button 
                              onClick={() => updateCartQty(item.cartItemId, -1)}
                              className="px-2 py-0.5 text-slate-600 font-bold hover:bg-slate-100 rounded-l"
                            >
                              -
                            </button>
                            <span className="px-2 text-xs font-bold text-black">{item.quantity}</span>
                            <button 
                              onClick={() => updateCartQty(item.cartItemId, 1)}
                              className="px-2 py-0.5 text-slate-600 font-bold hover:bg-slate-100 rounded-r"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {cart.length > 0 && (
                  <div className="pt-2">
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="text"
                          placeholder="Cupón (ej: ALPASO10)"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="w-full text-xs pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:border-lime-500 uppercase font-bold"
                        />
                      </div>
                      <button 
                        type="submit"
                        className="bg-black text-lime-400 px-3 py-2 rounded-xl text-xs font-bold"
                      >
                        Aplicar
                      </button>
                    </form>
                    {couponError && <p className="text-[10px] text-red-500 font-bold mt-1">{couponError}</p>}
                    {appliedDiscount > 0 && (
                      <p className="text-[10px] text-lime-600 font-bold mt-1">
                        ✓ ¡Cupón de {appliedDiscount * 100}% aplicado!
                      </p>
                    )}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
                  <div className="space-y-1.5 text-xs text-slate-600 font-medium">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-bold">${cartSubtotal.toLocaleString('es-AR')}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-lime-600 font-bold">
                        <span>Descuento</span>
                        <span>-${discountAmount.toLocaleString('es-AR')}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-black text-black pt-1 border-t border-slate-200">
                      <span>Total Final</span>
                      <span>${cartFinalTotal.toLocaleString('es-AR')}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleSendWhatsAppOrder}
                    className="w-full bg-black text-lime-400 py-3.5 rounded-2xl font-black text-sm shadow-md flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors"
                  >
                    <span>Enviar pedido por WhatsApp</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ================= MODAL INFORMACIÓN ================= */}
        {isInfoOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4">
            <div className="bg-white text-slate-900 w-full max-w-md max-h-[90vh] rounded-t-3xl sm:rounded-3xl overflow-y-auto flex flex-col shadow-2xl border border-slate-200">
              
              <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="font-black text-black text-base">Información del Local</h2>
                <button 
                  onClick={() => setIsInfoOpen(false)}
                  className="p-1 text-slate-500 hover:bg-slate-100 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-5 space-y-5 text-xs text-slate-600">
                <div className="text-center space-y-2">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto shadow-sm border border-slate-200">
                    <img src={business.logoImage} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-xl font-black text-black">{business.name}</h3>
                  <p className="leading-relaxed px-4">{business.about}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold uppercase tracking-wider text-[11px] text-slate-900 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-lime-600" /> Horarios de Atención
                  </h4>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 divide-y divide-slate-100">
                    {business.hours.map((h, i) => (
                      <div key={i} className="py-1.5 flex justify-between font-medium">
                        <span>{h.day}</span>
                        <span className="font-bold text-slate-800">{h.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold uppercase tracking-wider text-[11px] text-slate-900">Síguenos</h4>
                  <div className="flex gap-2">
                    <a href="#" className="p-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors">
                      <Instagram className="w-5 h-5" />
                    </a>
                    <a href="#" className="p-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors">
                      <Facebook className="w-5 h-5" />
                    </a>
                    <a href="#" className="p-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors">
                      <Phone className="w-5 h-5" />
                    </a>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold uppercase tracking-wider text-[11px] text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-lime-600" /> Ubicación
                  </h4>
                  <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 h-40 relative flex items-center justify-center text-center p-4">
                    <div className="space-y-1">
                      <MapPin className="w-8 h-8 text-lime-600 mx-auto animate-bounce" />
                      <p className="font-bold text-slate-800">{business.address}</p>
                      <button 
                        onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(business.address)}`, '_blank')}
                        className="mt-2 text-[11px] bg-black text-lime-400 px-3 py-1 rounded-lg font-bold shadow hover:bg-slate-900 transition-colors"
                      >
                        Abrir Google Maps
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ================= PANEL ADMINISTRADOR ================= */}
        {isAdminOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4">
            <div className="bg-white text-slate-900 w-full max-w-md max-h-[90vh] rounded-t-3xl sm:rounded-3xl overflow-y-auto flex flex-col shadow-2xl border border-slate-200">
              
              <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-lime-600" />
                  <h2 className="font-black text-black text-base">Panel Admin - AL PASO</h2>
                </div>
                <button 
                  onClick={() => setIsAdminOpen(false)}
                  className="p-1 text-slate-500 hover:bg-slate-100 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-4 space-y-6 text-xs">
                
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-black">Estado del Local</h3>
                    <p className="text-slate-500 text-[11px]">
                      {business.isOpen ? 'Atendiendo pedidos' : 'Cerrado temporalmente'}
                    </p>
                  </div>
                  <button 
                    onClick={() => setBusiness({ ...business, isOpen: !business.isOpen })}
                    className={`px-4 py-2 rounded-xl font-bold transition-colors ${
                      business.isOpen ? 'bg-lime-500 text-black' : 'bg-red-500 text-white'
                    }`}
                  >
                    {business.isOpen ? 'ABIERTO' : 'CERRADO'}
                  </button>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-sm text-black">Gestionar Menú (Supabase)</h3>
                    <button
                      onClick={() => setEditingProduct({ name: '', description: '', price: 1000, categoryId: 'empanadas', image: '' })}
                      className="bg-black text-lime-400 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 shadow"
                    >
                      <Plus className="w-3.5 h-3.5" /> Agregar
                    </button>
                  </div>

                  {editingProduct && (
                    <form onSubmit={handleSaveProduct} className="bg-slate-50 p-3 rounded-2xl space-y-2 mb-4 border border-slate-200">
                      <h4 className="font-bold text-xs text-black">
                        {editingProduct.id ? 'Editar Producto' : 'Nuevo Producto'}
                      </h4>
                      <input 
                        type="text" 
                        placeholder="Nombre del producto"
                        value={editingProduct.name}
                        onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                        required
                      />
                      <textarea 
                        placeholder="Descripción"
                        value={editingProduct.description || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                      />
                      <input 
                        type="text" 
                        placeholder="URL de Imagen"
                        value={editingProduct.image || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                      />
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          placeholder="Precio ($)"
                          value={editingProduct.price}
                          onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                          className="w-1/2 p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                          required
                        />
                        <select
                          value={editingProduct.categoryId}
                          onChange={(e) => setEditingProduct({...editingProduct, categoryId: e.target.value})}
                          className="w-1/2 p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                        >
                          <option value="empanadas">Empanadas</option>
                          <option value="sandwiches">Sándwiches</option>
                          <option value="promos">Promos</option>
                          <option value="bebidas">Bebidas</option>
                        </select>
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button 
                          type="button" 
                          onClick={() => setEditingProduct(null)}
                          className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg font-bold"
                        >
                          Cancelar
                        </button>
                        <button 
                          type="submit" 
                          className="px-3 py-1 bg-black text-lime-400 rounded-lg font-bold"
                        >
                          Guardar
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-2">
                    {products.map(p => (
                      <div key={p.id} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-black">{p.name}</p>
                          <p className="font-extrabold text-lime-600">${p.price?.toLocaleString('es-AR')}</p>
                        </div>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => setEditingProduct(p)}
                            className="p-1.5 text-slate-600 hover:text-black"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}