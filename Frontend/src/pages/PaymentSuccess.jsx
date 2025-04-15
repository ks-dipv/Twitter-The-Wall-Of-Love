import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center  p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-md w-full text-center">
        <CheckCircle2 className="mx-auto text-[#334155]" size={64} />
        <h1 className="text-2xl font-bold mt-4 text-[#334155]">Payment Successful</h1>
        <p className="mt-2 text-gray-600">
          Thank you for subscribing! Your payment was successful.
        </p>
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="mt-6 bg-[#334155] text-white px-6 py-2 rounded-xl hover:bg-[#94A3B8] transition-all duration-300"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
