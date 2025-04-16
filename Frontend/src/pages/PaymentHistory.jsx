import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CreditCard, Loader } from 'lucide-react'; // Optional: Add more icons as needed

const PaymentHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/subscription/history', {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setHistory(res.data);
      } catch (err) {
        console.error('Failed to fetch payment history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-[60vh] text-gray-600">
        <Loader className="animate-spin mr-2" />
        Loading payment history...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
     <nav className="bg-gray-300 p-4 text-black flex justify-between">
        <h1 className="text-lg font-bold">Payment History</h1>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        {history.length === 0 ? (
          <p className="text-center text-gray-600 mt-10">No subscription history found.</p>
        ) : (
          <div className="overflow-x-auto shadow-md rounded-xl bg-white p-4">
            <table className="min-w-full table-auto border-collapse">
              <thead className="bg-gray-100 text-gray-700 text-sm uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Plan</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Wall Limit</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Start Date</th>
                  <th className="px-4 py-3 text-left">End Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, idx) => (
                  <tr
                    key={idx}
                    className="border-t hover:bg-blue-50 transition-all"
                  >
                    <td className="px-4 py-3 font-medium text-gray-700">{idx + 1}</td>
                    <td className="px-4 py-3 text-gray-800">{item.plan_name}</td>
                    <td className="px-4 py-3 text-gray-800">₹{item.price?.toFixed(2)}</td>
                    <td className="px-4 py-3">{item.wall_limit}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          item.status === 'SUCCESS'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{new Date(item.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{new Date(item.end_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default PaymentHistoryPage;
