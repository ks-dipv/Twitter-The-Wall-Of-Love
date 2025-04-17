import React, { useEffect, useState } from "react";
import {
  getAllPlan,
  getCheckoutSessionUrl,
  getActiveSubscription,
  cancelSubscription,
} from "../services/api";
import { Loader2, CheckCircle, BadgeCheck } from "lucide-react";
import ConfirmationDialog from "../components/ConfirmationDialog";

const SubscriptionPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [activePlanId, setActivePlanId] = useState(null);
  const [canceling, setCanceling] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const getAllPlans = async () => {
    try {
      const res = await getAllPlan();
      setPlans(res.data);
    } catch (error) {
      console.log("Error fetching plans:", error);
    }
  };

  const fetchActivePlan = async () => {
    try {
      const res = await getActiveSubscription();
      setActivePlanId(res.data.plan_id);
    } catch (err) {
      console.log("No active plan:", err);
    }
  };

  useEffect(() => {
    getAllPlans();
    fetchActivePlan();
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

  const handleCancelSubscription = async () => {
    try {
      setCanceling(true);
      await cancelSubscription();
      alert(
        "Your subscription will be canceled at the end of the billing period."
      );
      setActivePlanId(null);
    } catch (error) {
      console.error("Cancellation failed:", error);
      alert("Failed to cancel subscription.");
    } finally {
      setCanceling(false);
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
              className={`relative bg-white border ${
                plan.id === activePlanId
                  ? "border-[#334155]"
                  : "border-gray-200"
              } rounded-2xl shadow-xl p-6 hover:shadow-2xl transition duration-300 flex flex-col items-center`}
            >
              {plan.id === activePlanId && (
                <div className="absolute top-3 right-3 text-[#334155] text-xs font-semibold flex items-center gap-1 bg-blue-100 px-2 py-1 rounded-full">
                  <BadgeCheck size={16} /> Active
                </div>
              )}

              <h2 className="text-2xl font-bold text-[#334155]">{plan.name}</h2>

              <p className="text-4xl font-extrabold text-gray-900 mt-4">
                ₹{plan.price}
                <span className="text-base font-medium text-gray-500">
                  {" "}
                  /mo
                </span>
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
                disabled={
                  plan.id === activePlanId ||
                  (loading && selectedPlanId === plan.id)
                }
                className="mt-8 w-full px-4 py-2 text-lg font-medium rounded-xl bg-[#334155] text-white hover:bg-[#94A3B8] transition-all disabled:opacity-50"
              >
                {loading && selectedPlanId === plan.id ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    Processing...
                  </div>
                ) : plan.id === activePlanId ? (
                  "Current Plan"
                ) : (
                  "Subscribe"
                )}
              </button>

              {/* Cancel button ONLY inside active plan box */}
              {plan.id === activePlanId && (
                <div className="mt-4 w-full">
                  <button
                    onClick={() => setShowConfirmDialog(true)}
                    disabled={canceling}
                    className="w-full px-4 py-2 text-base font-semibold rounded-xl border border-[#334155] text-[#334155] hover:bg-blue-50 transition-all disabled:opacity-50"
                  >
                    {canceling ? "Cancelling..." : "Cancel Subscription"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={async () => {
          setShowConfirmDialog(false);
          await handleCancelSubscription();
        }}
        title="Cancel Subscription"
        message="Are you sure you want to cancel your subscription? It will remain active until the end of the current billing period."
        confirmText="Yes, Cancel"
        cancelText="No, Keep It"
      />
    </div>
  );
};

export default SubscriptionPage;
