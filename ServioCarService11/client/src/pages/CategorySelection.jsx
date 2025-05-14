// src/components/CategorySelection.jsx
import { useNavigate } from 'react-router-dom';
import { UserIcon, WrenchScrewdriverIcon, BuildingOfficeIcon } from '@heroicons/react/24/solid';

function CategorySelection() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center w-full animate-fade-in py-8">
      <h2 className="text-4xl font-bold text-gray-800 mb-6 font-[Poppins] tracking-wide text-center animate-slide-up bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-orange-800">
        Select Your Journey
      </h2>
      <p className="text-gray-700 mb-8 text-center text-lg font-[Open Sans] max-w-md leading-relaxed animate-slide-up animate-delay-100">
        Step into Servio choose your role and unlock a seamless service experience.
      </p>
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md animate-slide-up animate-delay-200 border border-gray-100">
        {[
          { text: 'Vehicle Owner', path: '/signup/owner', icon: UserIcon },
          { text: 'Technician', path: '/signup/technician', icon: WrenchScrewdriverIcon },
          { text: 'Service Center', path: '/signup/service-center', icon: BuildingOfficeIcon },
        ].map((category, index) => (
          <button
            key={category.text}
            className={`group w-full p-3 bg-gradient-to-r from-orange-600 to-orange-800 text-white rounded-full font-medium text-lg font-[Raleway] transition-all duration-300 hover:scale-105 hover:shadow-xl hover:from-orange-700 hover:to-orange-900 animate-pulse-slow flex items-center justify-between mb-4 animate-slide-up animate-delay-${300 + index * 100}`}
            onClick={() => navigate(category.path)}
          >
            <span>{category.text}</span>
            <category.icon className="h-6 w-6 text-white opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
          </button>
        ))}
        <div className="mt-6 flex justify-center">
          <button
            className="text-orange-600 hover:text-orange-800 text-sm font-medium font-[Open Sans] underline underline-offset-4 transition-colors duration-300 animate-slide-up animate-delay-600"
            onClick={() => navigate('/login')}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default CategorySelection;