import { ref, onValue, update, remove } from "firebase/database";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { MonitorIcon, DownloadIcon, ResetIcon, ClockIcon, StatusActiveIcon, StatusIdleIcon, StatusReadyIcon } from "../components/Icons";

const WAHANA = {
  1: "Hologram",
  2: "Train 1",
  3: "Dream Farm",
  4: "Space-X",
  5: "Train 2",
  6: "Tunel",
  7: "Chamber AI & B.Gondola",
  8: "Gondola",
};

export default function Monitor() {
  const [logs, setLogs] = useState({});
  const [wahana, setWahana] = useState({});

  useEffect(() => {
    onValue(ref(db, "logs"), (snap) => {
      setLogs(snap.val() || {});
    });

    onValue(ref(db, "wahana"), (snap) => {
      setWahana(snap.val() || {});
    });
  }, []);

  const getColor = (step) => {
    if (step === 2) return "bg-blue-500";   // READY
    if (step === 1) return "bg-yellow-400"; // PROSES
    return "bg-gray-400";                  // IDLE
  };

  /* =========================
      RESET SEMUA
  ========================== */
  const resetAll = () => {
    const updates = {};

    for (let i = 1; i <= 8; i++) {
      updates[`wahana/wahana${i}`] = {
        ...wahana[`wahana${i}`],
        batch: 1,
        group: 1,
        step: 0,
        startTime: null,
      };
    }

    update(ref(db), updates);
    remove(ref(db, "logs"));
  };

  /* =========================
      DOWNLOAD CSV
  ========================== */
  const downloadCSV = () => {
    let csv = "Wahana,Batch,Group,Menit,Detik\n";

    Object.keys(logs).forEach((wahanaKey) => {
      const wahanaIndex = wahanaKey.replace("wahana", "");
      const wahanaName = WAHANA[wahanaIndex] || wahanaKey;

      Object.keys(logs[wahanaKey] || {}).forEach((batchKey) => {
        Object.keys(logs[wahanaKey][batchKey] || {}).forEach((groupKey) => {
          const d = logs[wahanaKey][batchKey][groupKey]?.duration;
          if (d) {
            csv += `${wahanaName},${batchKey.replace("batch","")},${groupKey.replace("group","")},${d.minutes},${d.seconds}\n`;
          }
        });
      });
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "monitor_wahana.csv";
    link.click();
  };

  const getStatusIcon = (step) => {
    if (step === 2) return <StatusReadyIcon className="w-5 h-5 text-white" />;
    if (step === 1) return <StatusActiveIcon className="w-5 h-5 text-black" />;
    return <StatusIdleIcon className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-6 lg:p-8 safe-top safe-bottom">
      
      {/* Header */}
      <div className="text-center mb-6 md:mb-8 fade-in">
        <div className="flex items-center justify-center gap-3 mb-2">
          <MonitorIcon className="w-8 h-8 md:w-10 md:h-10 text-yellow-400 icon-hover float-animation" />
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-yellow-400">
            Monitor Progress Wahana
          </h1>
        </div>
        <p className="text-sm md:text-base text-gray-400 fade-in-delay-1">
          Ringkasan Status dan Data Waktu
        </p>
      </div>

      {/* 🔵 8 BULATAN STATUS - Responsive */}
      <div className="w-full max-w-5xl mx-auto mb-8 md:mb-10 fade-in-delay-2">
        <h2 className="text-sm md:text-base font-semibold mb-4 text-center text-gray-400 uppercase tracking-wide">
          Status Real-time
        </h2>
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3 md:gap-4 lg:gap-5">
          {[1,2,3,4,5,6,7,8].map((i, index) => {
            const data = wahana[`wahana${i}`];
            return (
              <div 
                key={i} 
                className="flex flex-col items-center text-center stagger-item transform transition-all duration-300 hover:scale-110"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div 
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${getColor(data?.step)} shadow-lg transition-all duration-300 relative overflow-hidden ${
                    data?.step > 0 ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-yellow-400/50 status-pulse' : ''
                  }`} 
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    {getStatusIcon(data?.step)}
                  </div>
                </div>
                <span className="text-[10px] md:text-xs mt-2 font-semibold text-yellow-400 leading-tight">
                  {WAHANA[i]}
                </span>
                {data && (
                  <span className="text-[9px] md:text-[10px] text-yellow-300 mt-0.5">
                    B{data.batch} • G{data.group}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* LIST TIMING - Responsive Cards */}
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6 mb-8">
        {[1,2,3,4,5,6,7,8].map((i, index) => {
          const wahanaLogs = logs[`wahana${i}`] || {};
          return (
            <div 
              key={i}
              className={`stagger-item bg-gray-800/90 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl border border-gray-700/50 card-hover`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <h2 className="font-bold text-lg md:text-xl mb-4 md:mb-6 text-yellow-400 flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getColor(wahana[`wahana${i}`]?.step)} status-pulse`}></div>
                {WAHANA[i]}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                {[1,2,3,4,5].map((batch) => (
                  <div key={batch} className="bg-gray-700/50 rounded-lg p-3 md:p-4 transform transition-all duration-300 hover:scale-105 hover:bg-gray-700/70">
                    <div className="font-semibold text-sm md:text-base mb-2 md:mb-3 text-blue-400 flex items-center gap-2">
                      <ClockIcon className="w-4 h-4" />
                      Batch {batch}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs md:text-sm">
                      {[1,2,3].map((group) => {
                        const d =
                          wahanaLogs?.[`batch${batch}`]?.[`group${group}`]?.duration;

                        const m = d?.minutes != null ? String(d.minutes).padStart(2,"0") : "--";
                        const s = d?.seconds != null ? String(d.seconds).padStart(2,"0") : "--";

                        return (
                          <div 
                            key={group} 
                            className="bg-gray-600/50 rounded-md px-2 py-2 md:py-3 text-center border border-gray-600/50 transform transition-all duration-300 hover:border-yellow-400/50 hover:bg-gray-600/70"
                          >
                            <div className="text-[10px] md:text-xs text-gray-400 mb-1">G{group}</div>
                            <span className="text-yellow-300 font-mono font-bold text-xs md:text-sm">
                              {m}:{s}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto fade-in-delay-4">
        <button
          onClick={downloadCSV}
          className="px-6 md:px-8 py-3 md:py-4 rounded-xl bg-green-600 hover:bg-green-700 font-bold text-sm md:text-base transition-all duration-300 shadow-lg active:scale-95 flex-1 flex items-center justify-center gap-2 group hover:scale-105 glow-effect"
        >
          <DownloadIcon className="w-5 h-5 group-hover:translate-y-1 transition-transform duration-300" />
          <span>Unduh Data</span>
        </button>

        <button
          onClick={resetAll}
          className="px-6 md:px-8 py-3 md:py-4 rounded-xl bg-red-600 hover:bg-red-700 font-bold text-sm md:text-base transition-all duration-300 shadow-lg active:scale-95 flex-1 flex items-center justify-center gap-2 group hover:scale-105"
        >
          <ResetIcon className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
          <span>Reset Semua</span>
        </button>
      </div>
    </div>
  );
}
