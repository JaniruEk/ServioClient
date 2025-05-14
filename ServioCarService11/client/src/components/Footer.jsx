// src/components/Footer.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

function Footer() {
  const navigate = useNavigate();

  const footerLinks = [
    { text: 'Home', path: '/' },
    { text: 'About Us', path: '/about-us' },
    { text: 'Contact Us', path: '/contact' },
  ];

  const socialMediaLinks = [
    { name: 'Facebook', url: 'https://www.facebook.com', icon: <FaFacebookF className="h-5 w-5" /> },
    { name: 'Twitter', url: 'https://www.twitter.com', icon: <FaTwitter className="h-5 w-5" /> },
    { name: 'Instagram', url: 'https://www.instagram.com', icon: <FaInstagram className="h-5 w-5" /> },
    { name: 'LinkedIn', url: 'https://www.linkedin.com', icon: <FaLinkedinIn className="h-5 w-5" /> },
  ];

  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold font-[Poppins] mb-4">Servio</h3>
            <p className="text-gray-400 font-[Open Sans]">
              Mastering the Art of Auto Repair. Connect with us for seamless car service and repair management.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-xl font-bold font-[Raleway] mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.text}>
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(link.path);
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors duration-300 font-[Open Sans]"
                  >
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold font-[Raleway] mb-4">Contact Us</h3>
            <p className="text-gray-400 font-[Open Sans]">
              Email: support@servio.com
              <br />
              Phone: +1 (555) 123-4567
              <br />
              Address: 123 Auto Lane, Car City, CA 90210
            </p>
          </div>

          {/* Social Media Links */}
          <div>
            <h3 className="text-xl font-bold font-[Raleway] mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              {socialMediaLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-red-500 transition-all duration-300 hover:scale-110"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-center text-gray-400 font-[Open Sans]">
          © {new Date().getFullYear()} Servio. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;