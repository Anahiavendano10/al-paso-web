// En tu Header.jsx o dentro del AdminPanel.jsx
import { LogOut, Eye } from 'lucide-react';

export default function AdminHeader({ onSwitchToClientMode }) {
  const handleLogout = () => {
    // Elimina la sesión de admin guardada
    localStorage.removeItem('alpaso_admin_active');
    onSwitchToClientMode(); // Cambia la vista a cliente
  };

  return (
    <div className="bg-[#1d2e1b] text-[#95c623] p-4 flex justify-between items-center rounded-b-3xl">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="font-bold text-sm">Modo Administrador Activo</span>
      </div>

      {/* Botón para salir y pasar a vista de cliente */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-1.5 bg-[#95c623] text-[#1d2e1b] px-3 py-1.5 rounded-2xl font-bold text-xs hover:opacity-90 transition-all"
      >
        <Eye size={14} />
        <span>Ver como Cliente</span>
        <LogOut size={14} className="ml-1" />
      </button>
    </div>
  );
}