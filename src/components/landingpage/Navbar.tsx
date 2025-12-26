import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logoUrl from '/BellaLogo.png';

interface NavbarProps {
  scrollToSection: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ scrollToSection }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="w-full py-4 md:py-6 flex justify-between items-center px-4 md:px-10 bg-black relative">
      <div className="flex items-center gap-2">
        <img src={logoUrl} alt="Bella Wash Logo" className='w-20 h-20' />
      </div>

      {/* Desktop Menu */}
      <ul className="hidden md:flex gap-10 text-sm text-gray-300">
        <li className="cursor-pointer hover:text-white transition-colors" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</li>
        <li className="cursor-pointer hover:text-white transition-colors" onClick={() => scrollToSection('subscription')}>Subscription</li>
        <li className="cursor-pointer hover:text-white transition-colors" onClick={() => navigate('/partner-login')}>Partners</li>
        <li className="cursor-pointer hover:text-white transition-colors" onClick={() => scrollToSection('about')}>About</li>
        <li className="cursor-pointer hover:text-white transition-colors" onClick={() => scrollToSection('contact')}>Contact</li>
      </ul>

      {/* Desktop CTA */}
      <div className="hidden md:flex items-center gap-4">
        <a href="tel:07511172233" className="text-sm text-gray-300 hover:text-white transition-colors">075-111-72-233</a>
        <button onClick={() => navigate('/login')} className="px-5 py-2 rounded bg-yellow-500 text-black text-sm hover:bg-yellow-600 transition-colors">
          Subscribe Now
        </button>
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-white"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-black border-t border-gray-800 py-4 px-4 md:hidden z-50">
          <ul className="space-y-4 text-gray-300">
            <li className="cursor-pointer hover:text-white transition-colors" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setMobileMenuOpen(false); }}>Home</li>
            <li className="cursor-pointer hover:text-white transition-colors" onClick={() => scrollToSection('subscription')}>Subscription</li>
            <li className="cursor-pointer hover:text-white transition-colors" onClick={() => { navigate('/partner-login'); setMobileMenuOpen(false); }}>Partners</li>
            <li className="cursor-pointer hover:text-white transition-colors" onClick={() => scrollToSection('about')}>About</li>
            <li className="cursor-pointer hover:text-white transition-colors" onClick={() => scrollToSection('contact')}>Contact</li>
            <li className="pt-2 border-t border-gray-800">
              <a href="tel:07511172233" className="text-sm hover:text-white transition-colors block mb-3">075-111-72-233</a>
              <button onClick={() => { navigate('/login'); setMobileMenuOpen(false); }} className="w-full px-5 py-2 rounded bg-yellow-500 text-black text-sm hover:bg-yellow-600 transition-colors">
                Subscribe Now
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};
