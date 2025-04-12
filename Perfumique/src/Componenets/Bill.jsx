import React from 'react';
import { FaCheckCircle, FaPrint, FaDownload } from 'react-icons/fa';

const Bill = ({ cartItems, totalPrice, user, onClose }) => {
  const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
  const orderDate = new Date().toLocaleString();

  return (
    <div className="bg-black text-[#FFD700] border-2 border-[#FFD700] rounded-lg p-6 max-w-2xl w-full relative">
      {/* Order Confirmation Header */}
      <div className="text-center mb-6">
        <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-3" />
        <h2 className="text-3xl font-bold mb-1">Order Placed Successfully!</h2>
        <p className="text-gray-400">Your order #{orderNumber} has been confirmed</p>
      </div>

      {/* Bill Container */}
      <div className="border border-[#FFD700] rounded-md p-4 mb-6">
        {/* Bill Header */}
        <div className="flex justify-between items-center mb-4 border-b border-[#FFD700] pb-2">
          <div>
            <h3 className="text-xl font-bold">INVOICE</h3>
            <p className="text-sm text-gray-400">#{orderNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-sm">Date: {orderDate}</p>
          </div>
        </div>

        {/* Customer and Shop Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h4 className="font-semibold mb-1">BILLED TO:</h4>
            <p>{user?.displayName || 'Guest Customer'}</p>
            <p>{user?.email || 'No email provided'}</p>
          </div>
          <div className="text-right">
            <h4 className="font-semibold mb-1">PERFUME STORE</h4>
            <p>123 Fragrance Avenue</p>
            <p>Beirut, Lebanon</p>
            <p>+961 1 234 567</p>
          </div>
        </div>

        {/* Order Items Table */}
        <div className="mb-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#FFD700]">
                <th className="text-left pb-2">Item</th>
                <th className="text-right pb-2">Price</th>
                <th className="text-right pb-2">Qty</th>
                <th className="text-right pb-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.firestoreId} className="border-b border-gray-700">
                  <td className="py-3">
                    <div className="flex items-center">
                      {item.imageUrl && (
                        <img 
                          src={item.imageUrl} 
                          alt={item.name}
                          className="w-10 h-10 object-cover rounded-md mr-3 border border-[#FFD700]"
                        />
                      )}
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td className="text-right">${item.price.toFixed(2)}</td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right">${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t border-[#FFD700] pt-3">
          <div className="flex justify-between mb-1">
            <span>Subtotal:</span>
            <span>${totalPrice}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Shipping:</span>
            <span>$0.00</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Tax:</span>
            <span>$0.00</span>
          </div>
          <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-[#FFD700]">
            <span>TOTAL:</span>
            <span>${totalPrice}</span>
          </div>
        </div>
      </div>

      {/* Payment and Delivery Info */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border border-[#FFD700] rounded-md p-3">
          <h4 className="font-semibold mb-2">PAYMENT METHOD</h4>
          <p>Credit Card</p>
          <p className="text-sm text-gray-400">Ending in •••• 4242</p>
        </div>
        <div className="border border-[#FFD700] rounded-md p-3">
          <h4 className="font-semibold mb-2">DELIVERY METHOD</h4>
          <p>Standard Shipping</p>
          <p className="text-sm text-gray-400">Estimated 3-5 business days</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button 
          className="flex items-center px-4 py-2 border border-[#FFD700] rounded-md hover:bg-[#FFD700] hover:text-black transition-colors"
          onClick={() => window.print()}
        >
          <FaPrint className="mr-2" /> Print Receipt
        </button>
        <button 
          className="flex items-center px-4 py-2 bg-[#FFD700] text-black rounded-md font-semibold hover:bg-yellow-300 transition-colors"
          onClick={onClose}
        >
          <FaDownload className="mr-2" /> Download PDF
        </button>
      </div>

      {/* Thank You Message */}
      <p className="text-center text-gray-400 mt-6">
        Thank you for your purchase! A confirmation has been sent to your email.
      </p>
    </div>
  );
};

export default Bill;