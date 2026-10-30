import React, { useState, useEffect } from 'react';
import { Lock, LogOut, Sliders } from 'lucide-react';
import PinLoginModal from './components/PinLoginModal';
import AdminModal from './components/AdminModal';

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Verificar si hay sesión de admin guardada
  useEffect(() => {
    const adminActive = localStorage.getItem('alpaso_admin_active');
    if (adminActive === 'true') {
      setIsAdmin(true);
      setIsAdminModalOpen(true); // Abrir directamente el panel de gestión
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAdmin(true);
    setIsAdminModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('alpaso_admin_active');
    setIsAdmin(false);
    setIsAdminModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#e8edd6] flex flex-col">
      {/* BARRA SUPERIOR (HEADER) */}
      <header className="bg-[#1d2e1b] text-[#95c623] p-4 flex justify-between items-center shadow-lg">
        <h1 className="text-xl font-extrabold tracking-wide">AL PASO</h1>

        <div className="flex items-center gap-2">
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAdminModalOpen(true)}
                className="flex items-center gap-1 bg-[#2d472a] text-[#95c623] px-3 py-1.5 rounded-2xl font-bold text-xs hover:bg-[#385834]"
              >
                <Sliders size={14} />
                <span>Panel Admin</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 bg-[#95c623] text-[#1d2e1b] px-3 py-1.5 rounded-2xl font-bold text-xs active:scale-95 transition-all"
              >
                <LogOut size={14} />
                <span>Ver como Cliente</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsPinModalOpen(true)}
              className="p-2 rounded-full text-[#95c623] hover:bg-white/10 active:scale-95 transition-all"
              title="Acceso Administrador"
            >
              <Lock size={20} />
            </button>
          )}
        </div>
      </header>

      {/* BANNER DE ESTADO ADMIN */}
      {isAdmin && (
        <div className="bg-[#95c623] text-[#1d2e1b] px-4 py-1.5 text-center text-xs font-extrabold uppercase tracking-wider flex justify-between items-center">
          <span>PANEL DE ADMINISTRADOR ACTIVO</span>
          <button 
            onClick={() => setIsAdminModalOpen(true)} 
            className="underline font-black text-[11px] cursor-pointer"
          >
            Abrir Gestión de Productos
          </button>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <main className="p-4 flex-1 max-w-2xl mx-auto w-full">
        <div className="bg-white/70 backdrop-blur-sm p-6 rounded-3xl border border-[#1d2e1b]/10 text-center shadow-sm">
          <h2 className="text-xl font-bold text-[#1d2e1b] mb-2">Menú de Productos</h2>
          <p className="text-xs text-gray-600">
            {isAdmin 
              ? "Haz clic en 'Panel Admin' o en la barra superior para gestionar precios y productos." 
              : "Selecciona tus productos para realizar el pedido."}
          </p>
        </div>
      </main>

      {/* MODAL PARA INGRESAR PIN */}
      <PinLoginModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* MODAL DEL PANEL DE ADMINISTRACIÓN DE PRODUCTOS */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onSwitchToClient={handleLogout}
      />
    </div>
  );
}