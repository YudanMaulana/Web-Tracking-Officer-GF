import { ref, onValue, set } from "firebase/database";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { TrainIcon, PlayIcon, PauseIcon, StopIcon, ClockIcon, ResetIcon, ArrowLeftIcon, StatusActiveIcon, StatusIdleIcon, StatusReadyIcon } from "../components/Icons";

/**
 * Train:
 * wahana2 = Train 1
 * wahana5 = Train 2
 */

const TRAINS = {
  wahana2: "Train 1",
  wahana5: "Train 2",
};

const WAHANA_NAME = {
  1: "Hologram",
  2: "Train 1",
  3: "Dream Farm",
  4: "Space-X",
  5: "Train 2",
  6: "Tunel",
  7: "Chamber AI & B.Gondola",
  8: "Gondola",
};

export default function Train() {
  const [allWahana, setAllWahana] = useState({});
  const [liveTimers, setLiveTimers] = useState({});

  /* =========================
      REALTIME LISTENER
  ========================== */
  useEffect(() => {
    const unsub = onValue(ref(db, "wahana"), (snap) => {
      setAllWahana(snap.val() || {});
    });
    return () => unsub();
  }, []);

  /* =========================
      LIVE TIMER (KUNING)
  ========================== */
  useEffect(() => {
    const intervals = {};

    Object.keys(TRAINS).forEach((key) => {
      const data = allWahana[key];
      if (data?.step === 1 && data.startTime) {
        intervals[key] = setInterval(() => {
          const diff = Math.floor((Date.now() - data.startTime) / 1000);
          setLiveTimers((prev) => ({
            ...prev,
            [key]: {
              minutes: Math.floor(diff / 60),
              seconds: diff % 60,
            },
          }));
        }, 1000);
      } else {
        setLiveTimers((prev) => ({
          ...prev,
          [key]: { minutes: 0, seconds: 0 },
        }));
      }
    });

    return () => Object.values(intervals).forEach(clearInterval);
  }, [allWahana]);

  /* =========================
      WARNA STATUS
  ========================== */
  const getColor = (step) => {
    if (step === 2) return "bg-blue-500";
    if (step === 1) return "bg-yellow-400";
    return "bg-gray-400";
  };

  const calcDuration = (start) => {
    const diff = Math.floor((Date.now() - start) / 1000);
    return {
      minutes: Math.floor(diff / 60),
      seconds: diff % 60,
    };
  };

  /* =========================
      TOMBOL UTAMA
  ========================== */
  const handleClick = (key) => {
    const data = allWahana[key];
    if (!data) return;

    let { batch, group, step, startTime = null } = data;
    const now = Date.now();

    // IDLE → PROSES (START TIMER)
    if (step === 0) {
      step = 1;
      startTime = now;
    }

    // PROSES → READY (STOP TIMER + SIMPAN LOG)
    else if (step === 1) {
      step = 2;

      if (startTime) {
        const duration = calcDuration(startTime);
        set(ref(db, `logs/${key}/batch${batch}/group${group}`), { duration });
      }

      startTime = null;
    }

    // READY → IDLE (NEXT GROUP)
    else if (step === 2) {
      step = 0;
      group++;
      if (group > 3) {
        group = 1;
        batch++;
      }
    }

    set(ref(db, `wahana/${key}`), {
      batch,
      group,
      step,
      startTime,
    });
  };

  /* =========================
      PREVIOUS
  ========================== */
  const previousGroup = (key) => {
    const data = allWahana[key];
    if (!data) return;

    let { batch, group } = data;
    group--;

    if (group < 1) {
      batch = Math.max(1, batch - 1);
      group = 3;
    }

    set(ref(db, `wahana/${key}`), {
      ...data,
      batch,
      group,
      step: 0,
      startTime: null,
    });
  };

  const resetWrongClick = (key) => {
    const data = allWahana[key];
    if (!data) return;

    set(ref(db, `wahana/${key}`), {
      ...data,
      step: 0,
      startTime: null,
    });
  };

  /* =========================
      UI
  ========================== */
  const getStatusIcon = (step) => {
    if (step === 2) return <StatusReadyIcon className="w-5 h-5 text-white" />;
    if (step === 1) return <StatusActiveIcon className="w-5 h-5 text-black" />;
    return <StatusIdleIcon className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-4 md:px-6 py-6 md:py-8 safe-top safe-bottom">
      
      {/* Header */}
      <div className="text-center mb-6 md:mb-10 fade-in">
        <div className="flex items-center justify-center gap-3 mb-2">
          <TrainIcon className="w-8 h-8 md:w-10 md:h-10 text-yellow-400 icon-hover float-animation" />
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-yellow-400">
            Monitor Train
          </h1>
        </div>
        <p className="text-sm md:text-base text-gray-400 fade-in-delay-1">
          Kontrol Train 1 & Train 2
        </p>
      </div>

      {/* 🔵 STATUS 8 WAHANA - Responsive */}
      <div className="w-full max-w-5xl mx-auto mb-8 md:mb-12 fade-in-delay-2">
        <h2 className="text-sm md:text-base font-semibold mb-4 text-center text-gray-400 uppercase tracking-wide">
          Status Semua Wahana
        </h2>
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3 md:gap-4 lg:gap-5">
          {[1,2,3,4,5,6,7,8].map((i, index) => {
            const data = allWahana[`wahana${i}`];
            return (
              <div 
                key={i} 
                className="flex flex-col items-center text-center stagger-item transform transition-all duration-300 hover:scale-110"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {data && (
                  <div className="text-[10px] md:text-xs text-yellow-400 font-semibold mb-1.5">
                    B{data.batch} • G{data.group}
                  </div>
                )}
                <div 
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${getColor(data?.step)} shadow-lg transition-all duration-300 relative overflow-hidden ${
                    data?.step > 0 ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-yellow-400/50 status-pulse' : ''
                  }`} 
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    {getStatusIcon(data?.step)}
                  </div>
                </div>
                <span className="text-[10px] md:text-xs mt-2 opacity-90 font-medium leading-tight transition-opacity duration-300">
                  {WAHANA_NAME[i]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🚆 PANEL TRAIN - Responsive Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
        {Object.keys(TRAINS).map((key, index) => {
          const data = allWahana[key];
          const time = liveTimers[key] || { minutes: 0, seconds: 0 };

          return (
            <div 
              key={key}
              className={`stagger-item bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 md:p-8 text-center shadow-xl border border-gray-700/50 card-hover`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrainIcon className="w-6 h-6 md:w-8 md:h-8 text-yellow-400 icon-hover" />
                <h2 className="text-xl md:text-2xl font-bold text-yellow-400">
                  {TRAINS[key]}
                </h2>
              </div>

              {data && (
                <div className="flex items-center justify-center gap-2 mb-6 md:mb-8">
                  <ClockIcon className="w-4 h-4 text-gray-400" />
                  <p className="text-base md:text-lg text-gray-300 font-semibold">
                    Batch {data.batch} • Group {data.group}
                  </p>
                </div>
              )}

              {/* 🔘 TOMBOL UTAMA + LIVE TIMER */}
              <div className="mb-6 md:mb-8 relative">
                <button
                  onClick={() => handleClick(key)}
                  className={`w-32 h-32 md:w-40 md:h-40 rounded-full mx-auto flex items-center justify-center font-bold shadow-2xl transition-all duration-300 active:scale-95 hover:scale-105 relative overflow-hidden group ${
                    getColor(data?.step)
                  } ${
                    data?.step === 1 ? 'pulse-timer glow-effect' : ''
                  }`}
                >
                  <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {data?.step === 1 ? (
                    <div className="relative z-10 flex flex-col items-center gap-1">
                      <ClockIcon className="w-6 h-6 md:w-8 md:h-8 text-black animate-pulse" />
                      <span className="text-black text-xl md:text-2xl font-mono font-bold">
                        {String(time.minutes).padStart(2,"0")}:
                        {String(time.seconds).padStart(2,"0")}
                      </span>
                    </div>
                  ) : !data || data?.step === 0 ? (
                    <div className="relative z-10 flex flex-col items-center gap-2">
                      <PlayIcon className="w-10 h-10 md:w-12 md:h-12 text-gray-600" />
                      <span className="text-gray-600 text-xs md:text-sm font-semibold">START</span>
                    </div>
                  ) : (
                    <div className="relative z-10 flex flex-col items-center gap-2">
                      <CheckIcon className="w-10 h-10 md:w-12 md:h-12 text-white" />
                      <span className="text-white text-xs md:text-sm font-semibold">READY</span>
                    </div>
                  )}
                </button>
                
                {data?.step === 1 && (
                  <div className={`absolute inset-0 rounded-full ${getColor(data?.step)} opacity-30 blur-xl animate-ping -z-10`}></div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
                <button
                  onClick={() => previousGroup(key)}
                  className="px-6 md:px-8 py-3 md:py-4 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm md:text-base font-bold transition-all duration-300 shadow-lg active:scale-95 flex-1 flex items-center justify-center gap-2 group hover:scale-105"
                >
                  <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={() => resetWrongClick(key)}
                  className="px-6 md:px-8 py-3 md:py-4 bg-red-600 hover:bg-red-700 rounded-xl text-sm md:text-base font-bold transition-all duration-300 shadow-lg active:scale-95 flex-1 flex items-center justify-center gap-2 group hover:scale-105"
                >
                  <ResetIcon className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
