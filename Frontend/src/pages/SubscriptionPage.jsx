// src/pages/SubscriptionPage.jsx

import React from "react";

const SubscriptionPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Choose Your Subscription Plan</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Free Plan */}
        <div className="border rounded-lg p-4 flex flex-col items-center">
          <h2 className="text-xl font-semibold">Free</h2>
          <p className="text-sm text-gray-500">Create up to 3 Walls</p>
          <h3 className="text-2xl font-bold mt-2">₹0</h3>
          <button
            className="mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded cursor-not-allowed"
            disabled
          >
            Current Plan
          </button>
        </div>

        {/* Pro Plan */}
        <div className="border rounded-lg p-4 flex flex-col items-center">
          <h2 className="text-xl font-semibold">Basic</h2>
          <p className="text-sm text-gray-500">create up to 10 walls</p>
          <h3 className="text-2xl font-bold mt-2">₹499 / Month</h3>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Subscribe
          </button>
        </div>

        {/* Enterprise Plan */}
        <div className="border rounded-lg p-4 flex flex-col items-center">
          <h2 className="text-xl font-semibold">Pro plan</h2>
          <p className="text-sm text-gray-500">Unlimited Walls</p>
          <h3 className="text-2xl font-bold mt-2">₹4999 / Month</h3>
          <button className="mt-4 px-4 py-2 border border-gray-500 text-gray-700 rounded hover:bg-gray-100">
           Subscribe
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
