import React from 'react';
import WhyBellaImg from '/WhyBella.png';

interface FeaturesSectionProps {
  scrollToSection: (id: string) => void;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ scrollToSection }) => {
  return (
    <section id="about" className="bg-orange-50 text-black py-12 md:py-20 px-4">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 md:gap-16 items-center bg-white p-6 md:p-14 rounded-lg">
        <div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl mb-4 leading-tight">
            The Smarter Way <br /> to Keep Your Car Spotless
          </h2>
          <p className="text-gray-600 leading-relaxed text-sm md:text-base">
            Choose one subscription, get premium washes anytime, at any
            Bella partner across the UK. Fast, simple, and cost-effective.
            <br />
            <br />
            Use the mobile app to check in instantly with your QR code.
            Transparent monthly plans with no hidden fees.
          </p>

          <button onClick={() => scrollToSection('contact')} className="px-5 mt-4 md:mt-6 py-2 bg-yellow-500 text-black rounded text-sm hover:bg-yellow-600 transition-colors">
            About Us
          </button>
        </div>

        <img
          className="rounded-lg w-full h-64 md:h-auto object-cover"
          src={WhyBellaImg}
          alt="Car Wash"
        />
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 text-center gap-6 md:gap-10 mt-12 md:mt-20 max-w-5xl mx-auto">
        {[
          ["1,000+", "Vehicles Cleaned"],
          ["200+", "Happy Subscribers"],
          ["24/7", "Offline Support"],
          ["120+", "Active Locations"],
        ].map(([a, b]) => (
          <div key={a}>
            <h3 className="text-3xl font-bold">{a}</h3>
            <p className="text-gray-600 text-sm mt-1">{b}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
