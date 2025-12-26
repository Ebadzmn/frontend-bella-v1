import React from "react";
import { useNavigate } from "react-router-dom";
import HeroImg from "/Bella.png";

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="px-4 md:px-10 pt-8 md:pt-16 pb-12 md:pb-24 bg-gradient-to-b from-black to-[#1a1a1a]">
      <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center max-w-7xl mx-auto">
        <div className="md:pl-24">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight md:leading-snug">
            One Subscription. <br />
            Premium Shine. <br />
            Across the UK.
          </h1>
          <p className="mt-3 md:mt-4 text-gray-300 text-sm md:text-base max-w-sm">
            Wash your car anytime, anywhere—one flat monthly fee.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-4 md:mt-6">
            <button
              onClick={() => navigate("/register")}
              className="px-5 py-2.5 md:py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600 transition-colors text-sm md:text-base font-medium"
            >
              Subscribe Now
            </button>
            <button
              onClick={() => navigate("/app/map")}
              className="px-5 py-2.5 md:py-2 bg-gray-800 text-sm md:text-base rounded border border-gray-700 hover:bg-gray-700 transition-colors"
            >
              Find A Location
            </button>
          </div>
        </div>

        <img
          className="rounded-lg w-full object-cover h-64 md:h-auto"
          src={HeroImg}
          alt="Hero Car"
        />
      </div>
    </section>
  );
};
