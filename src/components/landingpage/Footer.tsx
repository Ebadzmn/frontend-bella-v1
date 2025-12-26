import React from 'react';

interface FooterProps {
  scrollToSection: (id: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ scrollToSection }) => {
  return (
    <footer className="bg-black text-gray-400 py-12 md:py-20 px-4 md:px-10">
      <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-16">
        <div>
          <h3 className="text-lg md:text-xl font-bold text-white">Bella</h3>
          <p className="text-sm mt-3 md:mt-4">
            One Subscription, Unlimited Shine.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 md:mb-4 text-sm md:text-base">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li className="cursor-pointer hover:text-white transition-colors" onClick={() => scrollToSection('subscription')}>Plans & Pricing</li>
            <li className="cursor-pointer hover:text-white transition-colors" onClick={() => scrollToSection('about')}>About Us</li>
            <li className="cursor-pointer hover:text-white transition-colors" onClick={() => scrollToSection('contact')}>Find Locations</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 md:mb-4 text-sm md:text-base">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li>Email: info@bellacarwash.co.uk</li>
            <li>Phone: 075-111-72-233</li>
            <li>Address: London, UK</li>
          </ul>
        </div>
      </div>
      
      <div className="border-t border-gray-800 mt-12 pt-8 text-center text-xs md:text-sm">
        <p>&copy; {new Date().getFullYear()} Bella Car Wash. All rights reserved.</p>
      </div>
    </footer>
  );
};
