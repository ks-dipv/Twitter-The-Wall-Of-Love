import React, { useEffect, useState } from "react";
import axios from "axios";

const SubscriptionPage = () => {
  const [plans, setPlans] = useState([]);

  const getAllPlans = async () => {
    try {
      const token = localStorage.getItem("access_token");
  
  
      const res = await axios.get("http://localhost:3000/api/plans", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      setPlans(res.data);
    } catch (error) {
      console.log("Error fetching plans:", error);
    }
  };
  

  useEffect(() => {
    getAllPlans();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Choose Your Subscription Plan</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="border rounded-lg p-4 flex flex-col items-center"
          >
            <h2 className="text-xl font-semibold">{plan.name}</h2>

            <h3 className="text-2xl font-bold mt-2">₹{plan.price} / Month</h3>

            <p className="text-sm text-gray-500 mt-1">
              Wall Limit: {plan.wallLimit}
            </p>

            <button
              className="mt-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => console.log("Subscribe Plan:", plan)}
            >
              Subscribe
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPage;
