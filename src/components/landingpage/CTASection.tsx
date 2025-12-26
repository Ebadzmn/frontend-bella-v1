import React from 'react';
import { useNavigate } from 'react-router-dom';

export const CTASection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 md:py-20 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-center px-4">
      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold max-w-4xl mx-auto leading-tight">
        Start your unlimited shine today <br className="hidden sm:block" />
        for as little as £22/month.
      </h2>

      <button onClick={() => navigate('/login')} className="mt-6 px-6 md:px-8 py-2.5 md:py-3 bg-black text-white rounded hover:bg-gray-900 transition-colors text-sm md:text-base font-medium">
        Subscribe Now
      </button>
    </section>
  );
};
