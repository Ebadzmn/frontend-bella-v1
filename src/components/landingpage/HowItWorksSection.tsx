import React from 'react';

export const HowItWorksSection: React.FC = () => {
  return (
    <section id="how-it-works" className="bg-orange-50 text-black py-12 md:py-20 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <h3 className="uppercase text-xs tracking-widest text-gray-500 mb-2">
          How it works
        </h3>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Easy to follow booking</h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-10 mt-8 md:mt-16">
          {[
            {
              icon: "💳",
              title: "Choose a Plan",
              text: "Pick your subscription package.",
            },
            {
              icon: "📱",
              title: "Get Your QR Code",
              text: "Instantly issued in the mobile app.",
            },
            {
              icon: "✨",
              title: "Shine Anytime",
              text: "Drive in anytime for a quick shine.",
            },
          ].map((i) => (
            <div key={i.title} className="text-center">
              <div className="text-4xl mb-4">{i.icon}</div>
              <h3 className="font-semibold mb-2">{i.title}</h3>
              <p className="text-gray-500 text-sm">{i.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
