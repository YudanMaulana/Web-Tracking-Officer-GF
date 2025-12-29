import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";
import { OFFICERS } from "../constants/officers";
import { MonitorIcon, StatusActiveIcon, StatusIdleIcon, StatusReadyIcon } from "../components/Icons";

export default function Display() {
  const [wahana, setWahana] = useState({});

  useEffect(() => {
    onValue(ref(db, "wahana"), (snap) => {
      setWahana(snap.val() || {});
    });
  }, []);

  const getColor = (step) => {
    if (step === 3) return "bg-blue-500";
    if (step > 0) return "bg-yellow-400";
    return "bg-gray-400";
  };

  const getStatusIcon = (step) => {
    if (step === 3) return <StatusReadyIcon className="w-12 h-12 md:w-16 md:h-16 text-white" />;
    if (step > 0) return <StatusActiveIcon className="w-12 h-12 md:w-16 md:h-16 text-black" />;
    return <StatusIdleIcon className="w-12 h-12 md:w-16 md:h-16" />;
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 md:px-6 py-8 md:py-12 safe-top safe-bottom">
      
      {/* Header */}
      <div className="text-center mb-8 md:mb-12 lg:mb-16 fade-in">
        <div className="flex items-center justify-center gap-3 mb-4">
          <MonitorIcon className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 text-yellow-400 icon-hover float-animation" />
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-yellow-400">
            STATUS PROSES SEMUA OFFICER
          </h1>
        </div>
        <p className="text-sm md:text-base text-gray-400 fade-in-delay-1">
          Overview Real-time Progress
        </p>
      </div>

      {/* 🔵 STATUS INDICATORS - Responsive Grid */}
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-6 md:gap-8 lg:gap-10">
          {[1,2,3,4,5,6,7].map((i, index) => {
            const data = wahana[`wahana${i}`];

            return (
              <div
                key={i}
                className="flex flex-col items-center text-center stagger-item transform transition-all duration-500 hover:scale-110"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full
                    flex items-center justify-center
                    shadow-2xl transition-all duration-500 relative overflow-hidden
                    ${getColor(data?.step)} ${
                      data?.step > 0 ? 'ring-4 ring-offset-4 ring-offset-black ring-yellow-400/50 scale-in status-pulse glow-effect' : ''
                    }`}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    {getStatusIcon(data?.step)}
                  </div>
                  {data?.step > 0 && (
                    <span className="absolute top-2 right-2 text-xs md:text-sm font-bold text-black bg-white/80 rounded-full w-6 h-6 flex items-center justify-center">
                      {data.step}
                    </span>
                  )}
                </div>

                <div className="mt-4 md:mt-6 text-base md:text-lg lg:text-xl font-semibold text-yellow-400 transform transition-all duration-300 hover:scale-105">
                  {OFFICERS[i]}
                </div>

                {data && (
                  <div className="mt-2 text-xs md:text-sm lg:text-base opacity-90 text-gray-300">
                    Batch {data.batch} • Group {data.group}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-12 md:mt-16 flex flex-wrap justify-center gap-6 md:gap-8 text-xs md:text-sm fade-in-delay-4">
        <div className="flex items-center gap-2 transform transition-all duration-300 hover:scale-110">
          <div className="w-4 h-4 rounded-full bg-yellow-400 bounce-animation"></div>
          <span className="text-gray-400">Proses</span>
        </div>
        <div className="flex items-center gap-2 transform transition-all duration-300 hover:scale-110">
          <div className="w-4 h-4 rounded-full bg-blue-500"></div>
          <span className="text-gray-400">Ready</span>
        </div>
        <div className="flex items-center gap-2 transform transition-all duration-300 hover:scale-110">
          <div className="w-4 h-4 rounded-full bg-gray-400"></div>
          <span className="text-gray-400">Idle</span>
        </div>
      </div>
    </div>
  );
}
