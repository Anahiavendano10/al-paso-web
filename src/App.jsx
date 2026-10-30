import React, { useState, useEffect } from 'react';
import { Lock, LogOut } from 'lucide-react';
import PinLoginModal from './components/PinLoginModal';

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  // Verificar si ya había una sesión activa de admin
  useEffect(() => {
    const adminActive = localStorage.getItem('alpaso_admin_active');
    if (adminActive === 'true') {
      setIsAdmin(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('alpaso_admin_active');
    setIsAdmin(false);
  };

  return (
    <div className="min-h-screen bg-[#e8edd6]">
      {/* BARRA SUPERIOR (HEADER) */}
      <header className="bg-[#1d2e1b] text-[#95c623] p-4 flex justify-between items-center shadow-lg">
        <h1 className="text-xl font-extrabold tracking-wide">AL PASO</h1>

        <div className="flex items-center gap-2">
          {isAdmin ? (
            /* Botón para Salir del Modo Admin */
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-[#95c623] text-[#1d2e1b] px-3 py-1.5 rounded-2xl font-bold text-xs active:scale-95 transition-all"
            >
              <LogOut size={14} />
              <span>Ver como Cliente</span>
            </button>
          ) : (
            /* Botón Discreto de Candado para Dueño/Admin */
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
        <div className="bg-[#95c623] text-[#1d2e1b] px-4 py-1.5 text-center text-xs font-extrabold uppercase tracking-wider">
          Panel de Administrador Activo
        </div>
      )}

      {/* CONTENIDO PRINCIPAL DE LA APP */}
      <main className="p-4">
        {/* Aquí van tus productos y catálogo */}
      </main>

      {/* MODAL DE INGRESO POR PIN */}
      <PinLoginModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onLoginSuccess={() => setIsAdmin(true)}
      />
    </div>
  );
}
