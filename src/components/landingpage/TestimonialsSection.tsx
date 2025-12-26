import React from 'react';

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="bg-white text-black py-12 md:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h3 className="uppercase text-xs text-gray-500 tracking-widest">
          Testimonials
        </h3>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium mt-2">
          Happy users says about <br className="hidden sm:block" /> our company
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 mt-8 md:mt-16">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-100 p-5 md:p-6 rounded">
              <img
                src={`https://randomuser.me/api/portraits/men/${20 + i}.jpg`}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover"
                alt="Customer"
              />
              <p className="text-xs md:text-sm text-gray-600 mt-3 md:mt-4 leading-relaxed">
                "Amazing service & highly convenient. The subscription pays for itself. Highly recommended!"
              </p>
              <h4 className="font-bold mt-3 md:mt-4 text-sm md:text-base">Felipe D. Juantorro</h4>
              <p className="text-xs text-gray-500">Market Director</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
