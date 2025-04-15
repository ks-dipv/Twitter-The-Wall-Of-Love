import React, { useEffect, useState } from "react";
import { getAllPlan, getCheckoutSessionUrl } from "../services/api";

const SubscriptionPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  const getAllPlans = async () => {
    try {
      const res = await getAllPlan();

      setPlans(res.data);
    } catch (error) {
      console.log("Error fetching plans:", error);
    }
  };

  useEffect(() => {
    getAllPlans();
  }, []);

  const handleSubscribe = async (planId) => {
    try {
      setLoading(true);

      const response = await getCheckoutSessionUrl(planId);

      // Redirect to Stripe checkout page
      if (response.data && response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert("Failed to process subscription. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
              Wall Limit: {plan.wall_limit}
            </p>

            <button
              className="mt-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400"
              onClick={() => handleSubscribe(plan.id)}
              disabled={loading}
            >
              {loading ? "Processing..." : "Subscribe"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPage;
