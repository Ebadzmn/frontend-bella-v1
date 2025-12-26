import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { ArrowLeft, Check, CreditCard } from "lucide-react";
import { getApiUrl } from "../config/api";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  duration?: number;
  quota?: number;
}

interface LocationState {
  clientSecret?: string;
  purchaseId?: number;
  amount?: number;
  description?: string;
  isExtraService?: boolean;
}

const CheckoutForm: React.FC<{
  plan: Plan;
  clientSecret?: string;
  purchaseId?: number;
  isExtraService?: boolean;
}> = ({ plan, clientSecret, isExtraService }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError("Card element not found");
      setProcessing(false);
      return;
    }

    try {
      if (isExtraService && clientSecret) {
        // Handle One-Time Purchase
        const { error: confirmError, paymentIntent } =
          await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
              card: cardElement,
            },
          });

        if (confirmError) {
          setError(confirmError.message || "Payment confirmation failed");
          setProcessing(false);
          return;
        }

        if (paymentIntent?.status !== "succeeded") {
          setError("Payment was not successful");
          setProcessing(false);
          return;
        }

        // Confirm purchase on backend
        const confirmResponse = await fetch(
          getApiUrl("extra-services/confirm-payment"),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              paymentIntentId: paymentIntent.id,
            }),
          }
        );

        if (!confirmResponse.ok) {
          setError("Failed to confirm purchase");
          setProcessing(false);
          return;
        }

        const data = await confirmResponse.json();
        navigate("/app/qr-code", {
          state: {
            newPurchase: data.purchase,
            newVerificationCode: data.verificationCode,
          },
        });
      } else {
        // Handle Subscription (Existing Logic)
        // Step 1: Create payment method
        const { error: paymentMethodError, paymentMethod } =
          await stripe.createPaymentMethod({
            type: "card",
            card: cardElement,
          });

        if (paymentMethodError) {
          setError(
            paymentMethodError.message || "Payment method creation failed"
          );
          setProcessing(false);
          return;
        }

        if (!paymentMethod) {
          setError("Failed to create payment method");
          setProcessing(false);
          return;
        }

        // Step 2: Attach payment method to customer via backend
        const attachResponse = await fetch(getApiUrl("payment-methods"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            paymentMethodId: paymentMethod.id,
          }),
        });

        if (!attachResponse.ok) {
          const attachData = await attachResponse.json();
          setError(attachData.error || "Failed to attach payment method");
          setProcessing(false);
          return;
        }

        // Step 3: Create subscription with attached payment method
        const subscribeResponse = await fetch(getApiUrl("billing/subscribe"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            planId: plan.id,
            paymentMethodId: paymentMethod.id,
          }),
        });

        const subscribeData = await subscribeResponse.json();

        if (!subscribeResponse.ok) {
          setError(subscribeData.error || "Subscription creation failed");
          setProcessing(false);
          return;
        }

        // Step 4: Confirm payment if client secret is provided
        if (subscribeData.clientSecret) {
          const { error: confirmError, paymentIntent } =
            await stripe.confirmCardPayment(subscribeData.clientSecret, {
              payment_method: paymentMethod.id,
            });

          if (confirmError) {
            setError(confirmError.message || "Payment confirmation failed");
            setProcessing(false);
            return;
          }

          if (paymentIntent?.status !== "succeeded") {
            setError("Payment was not successful");
            setProcessing(false);
            return;
          }
        }

        // Success - redirect to billing page
        navigate("/app/billing?subscribed=true");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError("An unexpected error occurred. Please try again.");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-gray-600 mb-2">
          <CreditCard className="w-5 h-5" />
          <span className="font-medium">Payment Information</span>
        </div>
        <div className="bg-white rounded border p-3">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {processing ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : isExtraService ? (
          `Pay £${plan.price}`
        ) : (
          `Subscribe for £${plan.price}/month`
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        {isExtraService
          ? "One-time payment. Non-refundable."
          : "By subscribing, you agree to our terms of service. You can cancel anytime."}
      </p>
    </form>
  );
};

const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const planId = searchParams.get("planId");
  const state = location.state as LocationState;

  useEffect(() => {
    if (state?.isExtraService) {
      setPlan({
        id: state.purchaseId || 0,
        name: state.description || "Extra Service",
        description: "One-time purchase",
        price: state.amount || 0,
      });
      setLoading(false);
      return;
    }

    if (!planId) {
      navigate("/app/billing");
      return;
    }

    const fetchPlan = async () => {
      try {
        setLoading(true);
        const response = await fetch(getApiUrl("billing/plans"));
        const data = await response.json();

        const selectedPlan = data.plans.find(
          (p: Plan) => Number(p.id) === Number(planId)
        );
        if (!selectedPlan) {
          setError("Plan not found");
          return;
        }

        setPlan(selectedPlan);
      } catch (err) {
        setError("Failed to load plan details");
        console.error("Error fetching plan:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [planId, navigate, state]);

  const getPlanFeatures = (plan: Plan) => {
    if (state?.isExtraService) {
      return ["One-time wash", "Valid for 30 days", "Instant QR Code"];
    }

    const features = [
      `${plan.quota === 999 ? "Unlimited" : plan.quota} washes per month`,
      `${plan.duration} days validity`,
      "QR code verification",
      "Mobile app access",
    ];

    if ((plan.quota || 0) >= 8) {
      features.push("Priority support");
    }
    if (plan.quota === 999) {
      features.push("VIP treatment");
      features.push("Premium locations");
    }

    return features;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">{error || "Plan not found"}</p>
          <button
            onClick={() =>
              navigate(
                state?.isExtraService ? "/app/extra-services" : "/app/billing"
              )
            }
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to {state?.isExtraService ? "Services" : "Plans"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() =>
              navigate(
                state?.isExtraService ? "/app/extra-services" : "/app/billing"
              )
            }
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to {state?.isExtraService ? "Services" : "Plans"}
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {state?.isExtraService
              ? "Complete Purchase"
              : "Complete Your Subscription"}
          </h1>
          <p className="mt-2 text-gray-600">
            Secure checkout powered by Stripe
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Plan Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Order Summary
            </h2>

            <div className="border rounded-lg p-4 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                  <p className="text-gray-600">{plan.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    £{plan.price}
                  </div>
                  <div className="text-gray-600">
                    {state?.isExtraService ? "/ one-time" : "/month"}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">What's included:</h4>
                <ul className="space-y-1">
                  {getPlanFeatures(plan).map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center text-sm text-gray-600"
                    >
                      <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>£{plan.price}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {state?.isExtraService
                  ? "One-time payment"
                  : "Billed monthly. Cancel anytime."}
              </p>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Payment Details
            </h2>

            <Elements stripe={stripePromise}>
              <CheckoutForm
                plan={plan}
                clientSecret={state?.clientSecret}
                purchaseId={state?.purchaseId}
                isExtraService={state?.isExtraService}
              />
            </Elements>

            <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span>Secured by</span>
              <svg className="h-6" viewBox="0 0 40 24" fill="currentColor">
                <path d="M0 24h40V0H0v24z" fill="#6772e5" />
                <path
                  d="M19.5 7.8c0-1.3-1-2.3-2.3-2.3s-2.3 1-2.3 2.3 1 2.3 2.3 2.3 2.3-1 2.3-2.3z"
                  fill="#fff"
                />
                <path
                  d="M25.9 11.8c0 3.9-3.2 7.1-7.1 7.1s-7.1-3.2-7.1-7.1 3.2-7.1 7.1-7.1 7.1 3.2 7.1 7.1z"
                  fill="#fff"
                />
              </svg>
              <span>Stripe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
