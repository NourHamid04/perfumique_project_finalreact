import React, { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react"; // Assuming you're using Lucide icons

const OrderDetailPopup = ({ order, closePopup }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Safely get order details with defaults
  const orderId = order?.id || "N/A";
  const customerName = order?.customer || "Unknown Customer";
  const totalPrice = order?.totalPrice ? `$${order.totalPrice}` : "$0.00";
  const status = order?.status || "Status Unknown";

  // Ensure items is an array and has minimum required fields
  const items = (Array.isArray(order?.items) ? order.items : [])
    .map(item => ({
      name: item?.name || "Unnamed Product",
      price: item?.price ? `$${item.price.toFixed(2)}` : "$0.00",
      quantity: item?.quantity || 1
    }));

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50 p-4">
      <div className="bg-black border-2 border-[#FFD700] rounded-lg shadow-2xl shadow-yellow-500/50 p-6 w-full max-w-md relative">
        <button 
          onClick={closePopup}
          className="absolute top-3 right-3 text-[#FFD700] hover:text-yellow-300"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <h3 className="text-xl font-bold text-[#FFD700] mb-4 border-b border-[#FFD700] pb-2">
          Order Details
        </h3>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="animate-spin text-[#FFD700]" size={32} />
          </div>
        ) : (
          <div className="space-y-3 text-gray-200">
            {error && (
              <p className="text-red-400 text-sm mb-2">{error}</p>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="font-semibold text-[#FFD700]">Order ID:</p>
                <p className="truncate">{orderId}</p>
              </div>
              <div>
                <p className="font-semibold text-[#FFD700]">Customer:</p>
                <p className="truncate">{customerName}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="font-semibold text-[#FFD700]">Total:</p>
                <p>{totalPrice}</p>
              </div>
              <div>
                <p className="font-semibold text-[#FFD700]">Status:</p>
                <p className="capitalize">{status.toLowerCase()}</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="font-semibold text-[#FFD700] mb-2">Items ({items.length}):</p>
              {items.length > 0 ? (
                <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {items.map((item, index) => (
                    <li key={index} className="flex justify-between border-b border-gray-700 pb-2">
                      <span>
                        {item.name} 
                        <span className="text-gray-400 text-sm ml-2">×{item.quantity}</span>
                      </span>
                      <span className="text-[#FFD700]">{item.price}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 italic">No items in this order</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailPopup;
