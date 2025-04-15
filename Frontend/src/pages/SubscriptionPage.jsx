import React, { useEffect, useState } from "react";
import { getAllPlan, getCheckoutSessionUrl } from "../services/api";
import { Loader2, CheckCircle } from "lucide-react";

const SubscriptionPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);

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
      setSelectedPlanId(planId);

      const response = await getCheckoutSessionUrl(planId);

      if (response.data && response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert("Failed to process subscription. Please try again.");
    } finally {
      setLoading(false);
      setSelectedPlanId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br  py-12 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-gray-600 mb-12 text-lg">
          Pick the perfect plan to suit your needs and unlock all features.
        </p>

        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="relative bg-white border border-gray-200 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition duration-300 flex flex-col items-center"
            >
              <h2 className="text-2xl font-bold text-[#334155]">{plan.name}</h2>

              <p className="text-4xl font-extrabold text-gray-900 mt-4">
                ₹{plan.price}
                <span className="text-base font-medium text-gray-500"> /mo</span>
              </p>

              <ul className="mt-6 space-y-2 text-gray-600 text-sm w-full text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle className="text-green-500" size={18} />
                  Wall Limit: {plan.wall_limit}
                </li>
                <li className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={18} />
                  Subscription is valid for 1 month
                </li>
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading && selectedPlanId === plan.id}
                className="mt-8 w-full px-4 py-2 text-lg font-medium rounded-xl bg-[#334155] text-white hover:bg-[#94A3B8] transition-all disabled:opacity-50"
              >
                {loading && selectedPlanId === plan.id ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    Processing...
                  </div>
                ) : (
                  "Subscribe"
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
