import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../config/api";
import logo from "../../assets/logo.png";
import logoCagayanDeOro from "../../assets/cdogolden_white.png";
import logoHCC from "../../assets/cdo_hcc_logo.png";
import logoTourism from "../../assets/toursm_logo.png";
import logoRIS from "../../assets/cdeo_ris_logo.png";

const Footer = () => {
  const [contactSettings, setContactSettings] = useState({
    phone: '+63 88 123 4567',
    email: 'cdocitymuseum@cagayandeoro.gov.ph',
    address_line1: 'Gaston Park, Cagayan de Oro City',
    address_line2: 'Misamis Oriental, Philippines',
    operating_hours: 'Mon-Fri: 8:00 AM - 5:00 PM',
    email_response_time: "We'll respond within 24 hours",
    logo_url: null
  });
  const [socialMedia, setSocialMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContactSettings = async () => {
      try {
        const res = await api.get("/api/contact-settings");
        if (res.data.success) {
          setContactSettings(res.data.contact || contactSettings);
          setSocialMedia(res.data.socialMedia || []);
        }
      } catch (err) {
        console.error('Error fetching contact settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContactSettings();
  }, []);

  // Get icon component for social media
  const getSocialIcon = (iconClass, url) => {
    // For Font Awesome icons, we'll use a wrapper with white text color
    if (iconClass.includes('fa-')) {
      return <i className={`${iconClass} text-white text-sm`}></i>;
    }
    // Fallback for custom icons
    return <i className="fa-solid fa-link text-white text-sm"></i>;
  };

  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Museum Info */}
          <div className="space-y-3 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3">
              <img 
                src={contactSettings.logo_url ? (contactSettings.logo_url.startsWith('http') ? contactSettings.logo_url : `http://localhost:3000${contactSettings.logo_url}`) : logo} 
                alt="Logo" 
                className="w-10 h-10"
                onError={(e) => {
                  e.target.src = logo; // Fallback to default logo
                }}
              />
              <div>
                <h3 className="text-lg font-bold">City Museum of Cagayan de Oro</h3>
                <p className="text-xs text-gray-300">Heritage Studies Center</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-tight">
              Preserving and showcasing the rich cultural heritage of Cagayan de Oro through 
              carefully curated exhibits and educational programs.
            </p>
            <div className="flex space-x-3">
              {socialMedia.length > 0 ? (
                socialMedia.map((social) => (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-[#8B6B21] hover:bg-[#D4AF37] rounded-lg flex items-center justify-center transition-colors duration-300"
                    title={social.name}
                  >
                    {getSocialIcon(social.icon, social.url)}
                  </a>
                ))
              ) : (
                // Fallback if no social media links
                <>
                  <a 
                    href="#" 
                    className="w-8 h-8 bg-[#8B6B21] hover:bg-[#D4AF37] rounded-lg flex items-center justify-center transition-colors duration-300"
                    title="Facebook"
                  >
                    <i className="fa-brands fa-facebook text-white text-sm"></i>
                  </a>
                  <a 
                    href={`mailto:${contactSettings.email}`}
                    className="w-8 h-8 bg-[#8B6B21] hover:bg-[#D4AF37] rounded-lg flex items-center justify-center transition-colors duration-300"
                    title="Email"
                  >
                    <i className="fa-solid fa-envelope text-white text-sm"></i>
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 lg:col-span-1">
            <h4 className="text-base font-semibold border-b border-gray-600 pb-1">Quick Links</h4>
            <ul className="space-y-1.5">
              <li>
                <a 
                  href="#about" 
                  className="text-gray-300 hover:text-[#8B6B21] transition-colors duration-300 flex items-center"
                >
                  <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  About Us
                </a>
              </li>
              <li>
                <a 
                  href="#exhibit" 
                  className="text-gray-300 hover:text-[#8B6B21] transition-colors duration-300 flex items-center"
                >
                  <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Exhibits
                </a>
              </li>
              <li>
                <a 
                  href="#event" 
                  className="text-gray-300 hover:text-[#8B6B21] transition-colors duration-300 flex items-center"
                >
                  <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Events
                </a>
              </li>
              <li>
                <Link 
                  to="/schedule" 
                  className="text-gray-300 hover:text-[#8B6B21] transition-colors duration-300 flex items-center"
                >
                  <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Schedule Visit
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-3 lg:col-span-1">
            <h4 className="text-base font-semibold border-b border-gray-600 pb-1">Contact Info</h4>
            <div className="space-y-2">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-[#8B6B21] rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-300 text-xs">{contactSettings.address_line1 || 'Gaston Park, Cagayan de Oro City'}</p>
                  <p className="text-gray-400 text-xs">{contactSettings.address_line2 || 'Misamis Oriental, Philippines'}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-[#8B6B21] rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-300 text-xs">{contactSettings.phone || '+63 88 123 4567'}</p>
                  <p className="text-gray-400 text-xs">{contactSettings.operating_hours || 'Mon-Fri: 8:00 AM - 5:00 PM'}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-[#8B6B21] rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-300 text-xs">{contactSettings.email || 'info@cdocitymuseum.gov.ph'}</p>
                  <p className="text-gray-400 text-xs">{contactSettings.email_response_time || "We'll respond within 24 hours"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Partner Logos Section */}
        <div className="border-t border-gray-700 mt-6 pt-6">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-6">
            <img 
              src={logoCagayanDeOro} 
              alt="Cagayan de Oro City Logo" 
              className="h-12 sm:h-16 object-contain opacity-90 hover:opacity-100 transition-opacity duration-300"
            />
            <img 
              src={logoHCC} 
              alt="Historical & Cultural Commission Logo" 
              className="h-12 sm:h-16 object-contain opacity-90 hover:opacity-100 transition-opacity duration-300"
            />
            <img 
              src={logoTourism} 
              alt="Tourism Logo" 
              className="h-12 sm:h-16 object-contain opacity-90 hover:opacity-100 transition-opacity duration-300"
            />
            <img 
              src={logoRIS} 
              alt="RIS Logo" 
              className="h-12 sm:h-16 object-contain opacity-90 hover:opacity-100 transition-opacity duration-300"
            />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <p className="text-gray-300 text-xs text-center sm:text-left">
                © 2025 City Museum of Cagayan de Oro. All rights reserved.
              </p>
              <span className="hidden sm:block text-gray-500">|</span>
              <p className="text-gray-300 text-xs text-center sm:text-left">
                Built with ❤️ for our community
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="flex items-center space-x-2 text-gray-300 hover:text-[#8B6B21] transition-colors duration-300 group"
                title="Staff Login"
              >
                <div className="w-6 h-6 bg-gray-700 group-hover:bg-[#8B6B21] rounded-lg flex items-center justify-center transition-colors duration-300">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-xs font-medium">Staff Login</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
