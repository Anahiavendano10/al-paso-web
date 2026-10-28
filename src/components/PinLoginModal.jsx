import React, { useState } from 'react';
import { Lock, X, LogIn, Delete } from 'lucide-react';
import { supabase } from '../supabase';

export default function PinLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleKeyPress = (num) => {
    if (pin.length < 6) {
      setPin(prev => prev + num);
      setErrorMsg('');
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (pin.length < 4) {
      setErrorMsg('El PIN debe tener al menos 4 dígitos');
      return;
    }

    setLoading(true);
    try {
      // Validar el PIN directamente en Supabase
      const { data, error } = await supabase
        .from('admin_config')
        .select('pin_code')
        .eq('id', 1)
        .single();

      if (error) throw error;

      if (data && data.pin_code === pin) {
        // Guardar estado de admin en la sesión del navegador
        localStorage.setItem('alpaso_admin_active', 'true');
        onLoginSuccess();
        setPin('');
        onClose();
      } else {
        setErrorMsg('PIN incorrecto. Inténtalo de nuevo.');
        setPin('');
      }
    } catch (err) {
      setErrorMsg('Error de conexión o PIN no configurado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
      <div className="bg-[#e8edd6] w-full max-w-xs rounded-3xl p-6 border-2 border-[#1d2e1b] shadow-2xl">
        
        {/* Encabezado */}
        <div className="flex justify-between items-center pb-3 border-b border-[#1d2e1b]/20">
          <div className="flex items-center gap-2 text-[#1d2e1b]">
            <Lock size={18} />
            <h3 className="font-bold text-base">Acceso por PIN</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-[#1d2e1b] hover:bg-[#95c623]/30">
            <X size={18} />
          </button>
        </div>

        {/* Display del PIN */}
        <div className="my-4 text-center">
          <p className="text-xs font-bold text-[#1d2e1b] uppercase mb-2">Ingresa tu clave de dueño:</p>
          <div className="flex justify-center gap-2 mb-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`w-10 h-12 rounded-2xl border-2 flex items-center justify-center text-xl font-extrabold ${
                  pin[i]
                    ? 'border-[#1d2e1b] bg-[#1d2e1b] text-[#95c623]'
                    : 'border-[#1d2e1b]/30 bg-white text-[#1d2e1b]'
                }`}
              >
                {pin[i] ? '•' : ''}
              </div>
            ))}
          </div>

          {errorMsg && (
            <p className="text-xs text-red-600 font-bold mt-1 bg-red-100 p-1.5 rounded-xl">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Teclado Numérico Tactil */}
        <div className="grid grid-cols-3 gap-2 my-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num.toString())}
              className="py-3 bg-white text-[#1d2e1b] font-extrabold text-lg rounded-2xl border border-[#1d2e1b]/20 active:bg-[#95c623] hover:border-[#1d2e1b]"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleDelete}
            className="py-3 bg-red-100 text-red-700 font-bold text-sm rounded-2xl border border-red-200 flex items-center justify-center"
          >
            <Delete size={18} />
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="py-3 bg-white text-[#1d2e1b] font-extrabold text-lg rounded-2xl border border-[#1d2e1b]/20 active:bg-[#95c623]"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || pin.length < 4}
            className="py-3 bg-[#1d2e1b] text-[#95c623] font-bold text-xs rounded-2xl flex items-center justify-center disabled:opacity-40"
          >
            <LogIn size={18} />
          </button>
        </div>

      </div>
    </div>
  );
}