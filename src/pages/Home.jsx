import { Link } from "react-router-dom";
import Logo from "../assets/logo.png";
import { MonitorIcon, SettingsIcon, TrainIcon, HomeIcon } from "../components/Icons";

const wahanaCards = [
  { id: 1, name: "Hologram", path: "/officer/1", icon: "🤖" },
  { id: "train", name: "Train 1 & 2", path: "/officer/train", icon: "🚆" },
  { id: 3, name: "Dream Farm", path: "/officer/3", icon: "🐮" },
  { id: 4, name: "Space-X", path: "/officer/4", icon: "🚀" },
  { id: 6, name: "Tunel", path: "/officer/6", icon: "📖" },
  { id: 7, name: "Chamber AI", path: "/officer/7", icon: "🖼️" },
  { id: 8, name: "Gondola", path: "/officer/8", icon: "🚢" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col items-center justify-center px-4 py-8 safe-top safe-bottom animate-gradient">
      {/* Logo Section */}
      <div className="mb-8 md:mb-12 text-center fade-in">
        <div className="relative inline-block">
          <img 
            src={Logo} 
            alt="logo" 
            className="w-40 h-auto mx-auto mb-4 md:w-48 lg:w-56 drop-shadow-2xl float-animation" 
          />
          <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-3xl -z-10 scale-in"></div>
        </div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-yellow-400 fade-in-delay-1">
          Officer Progress
        </h1>
        <p className="text-sm md:text-base text-gray-400 mt-2 fade-in-delay-2">
          Monitoring System
        </p>
      </div>

      {/* Wahana Grid - Responsive */}
      <div className="w-full max-w-6xl mb-8 md:mb-12 fade-in-delay-2">
        <div className="flex items-center justify-center gap-2 mb-4 md:mb-6">
          <HomeIcon className="w-5 h-5 md:w-6 md:h-6 text-yellow-400 icon-hover" />
          <h2 className="text-lg md:text-xl font-semibold text-center text-gray-300">
            Pilih Wahana
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
          {wahanaCards.map((wahana, index) => (
            <Link 
              key={wahana.id}
              to={wahana.path}
              className={`stagger-item bg-gray-800/90 backdrop-blur-sm hover:bg-gray-700/90 px-4 py-6 md:px-6 md:py-8 rounded-xl text-center font-semibold text-sm md:text-base lg:text-lg transition-all duration-300 shadow-lg hover:shadow-2xl card-hover active:scale-95 border border-gray-700/50 hover:border-yellow-500/70 flex flex-col items-center gap-2 group`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className="text-3xl md:text-4xl lg:text-5xl transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                {wahana.icon}
              </span>
              <span className="transition-colors duration-300">{wahana.name}</span>
              {wahana.id === "train" && (
                <TrainIcon className="w-4 h-4 md:w-5 md:h-5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full max-w-md fade-in-delay-4">
        <Link
          to="/monitor"
          className="bg-blue-600 hover:bg-blue-700 px-6 py-4 md:px-8 md:py-5 rounded-xl font-bold text-center text-base md:text-lg transition-all duration-300 shadow-lg hover:shadow-2xl active:scale-95 flex-1 flex items-center justify-center gap-2 group glow-effect hover:scale-105"
        >
          <MonitorIcon className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform duration-300" />
          <span>MODE MONITOR</span>
        </Link>

        <Link
          to="/developer"
          className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-4 md:px-8 md:py-5 rounded-xl font-bold text-center text-base md:text-lg transition-all duration-300 shadow-lg hover:shadow-2xl active:scale-95 flex-1 flex items-center justify-center gap-2 group hover:scale-105"
        >
          <SettingsIcon className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-90 transition-transform duration-300" />
          <span>DEVELOPER</span>
        </Link>
      </div>
    </div>
  );
}
