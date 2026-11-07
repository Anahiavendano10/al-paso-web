
import React from 'react';
import { X } from 'lucide-react';

export default function CartDrawer({
  cart,
  isOpen,
  onClose,
  onRemove,
  onCheckout,
  totalPrice
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[85vh] overflow-y-auto relative">
        <div className="flex justify-between items-center pb-3 border-b">
          <h3 className="font-black text-base text-black">
            Tu Pedido
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        {cart.length === 0 ? (
          <p className="text-center text-xs text-gray-400 py-8">
            Tu carrito está vacío
          </p>
        ) : (
          <div className="divide-y divide-gray-100 my-4">
            {cart.map((item) => (
              <div
                key={item.cartId}
                className="py-3 flex justify-between items-center"
              >
                <div>
                  <p className="font-extrabold text-xs text-black">
                    {item.name} (x{item.quantity})
                  </p>

                  {item.notes && (
                    <p className="text-[10px] text-gray-600 italic">
                      Notas: {item.notes}
                    </p>
                  )}

                  <p className="text-[10px] text-gray-500 font-bold">
                    ${item.totalPrice}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onRemove(item.cartId)}
                  className="text-red-500 p-1"
                  title="Quitar producto"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="pt-3 border-t flex justify-between items-center font-black text-sm mb-4 text-black">
          <span>Total</span>
          <span>${totalPrice}</span>
        </div>

        <button
          type="button"
          onClick={onCheckout}
          disabled={cart.length === 0}
          style={{
            backgroundColor: cart.length > 0
              ? '#95c623'
              : '#E5E7EB'
          }}
          className="w-full text-black py-3 rounded-2xl font-black text-xs shadow-md disabled:opacity-60"
        >
          Continuar con el pedido en WhatsApp
        </button>
      </div>
    </div>
  );
}
