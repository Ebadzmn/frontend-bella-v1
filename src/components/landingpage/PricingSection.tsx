import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../../config/api';

interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  vehicleType: 'CAR' | 'TAXI' | 'VAN';
  tier: string;
}

export const PricingSection: React.FC = () => {
  const navigate = useNavigate();
  const [selectedVehicleType, setSelectedVehicleType] = useState<'Cars' | 'Vans' | 'Taxis'>('Cars');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch(getApiUrl('plans'));
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            setPlans(data.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // Map backend vehicle types to frontend display names
  const vehicleTypeMap: Record<string, 'Cars' | 'Vans' | 'Taxis'> = {
    'CAR': 'Cars',
    'VAN': 'Vans',
    'TAXI': 'Taxis'
  };

  // Group plans by vehicle type
  const getPlansByType = (type: 'Cars' | 'Vans' | 'Taxis') => {
    const backendType = Object.keys(vehicleTypeMap).find(key => vehicleTypeMap[key] === type);
    if (!backendType) return [];
    
    return plans.filter(p => p.vehicleType === backendType);
  };

  const currentPlans = getPlansByType(selectedVehicleType);

  return (
    <section id="subscription" className="py-12 md:py-20 bg-gradient-to-b from-[#111] to-black px-4">
      <div className="max-w-6xl mx-auto text-center">
        <h3 className="uppercase text-xs text-gray-400 tracking-widest">
          Subscription
        </h3>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold max-w-3xl text-center mx-auto mt-2">
          Elevate Your Ride Without Breaking the Bank!
        </h2>

        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mt-6 md:mt-10">
          {(["Cars", "Vans", "Taxis"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedVehicleType(type)}
              className={`px-4 md:px-6 py-2 rounded text-base md:text-lg transition-colors ${selectedVehicleType === type
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
            >
              {type}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-16 text-white">Loading plans...</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 mt-8 md:mt-16">
            {currentPlans.length > 0 ? (
              currentPlans.map((plan) => (
                <div key={plan.id} className="bg-white text-black p-6 md:p-8 rounded shadow flex flex-col">
                  <h3 className="font-bold text-lg md:text-xl mb-2">{plan.tier || plan.name}</h3>
                  <p className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">£{plan.price}/month</p>
                  <p className="text-gray-600 text-sm md:text-base mb-4 md:mb-6 min-h-[60px] flex-grow">{plan.description}</p>
                  <button onClick={() => navigate('/login')} className="w-full md:w-auto px-6 py-2 bg-yellow-500 rounded text-sm hover:bg-yellow-600 transition-colors mt-auto">Subscribe Now</button>
                </div>
              ))
            ) : (
              <div className="col-span-full text-gray-400 text-center py-10">
                No plans available for {selectedVehicleType}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
