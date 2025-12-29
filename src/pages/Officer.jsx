import { useParams } from "react-router-dom";
import { ref, onValue, set } from "firebase/database";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { PlayIcon, PauseIcon, StopIcon, ClockIcon, ResetIcon, ArrowLeftIcon, StatusActiveIcon, StatusIdleIcon, StatusReadyIcon } from "../components/Icons";

/**
 * INDEX:
 * 1 = Hologram
 * 2 = Train 1
 * 3 = Dream Farm
 * 4 = Space-X
 * 5 = Train 2
 * 6 = Tunel
 * 7 = Chamber AI & B.Gondola
 * 8 = Gondola
 */

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

export default function Officer() {
  const { id } = useParams();
  const key = `wahana${id}`;

  const [allWahana, setAllWahana] = useState({});
  const [liveTime, setLiveTime] = useState({ minutes: 0, seconds: 0 });

  const myData = allWahana[key];

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
      LIVE TIMER (KUNING & BIRU)
  ========================== */
  useEffect(() => {
    let timer;

    if (
      (myData?.step === 1 || myData?.step === 2) &&
      myData.startTime
    ) {
      timer = setInterval(() => {
        const diff = Math.floor((Date.now() - myData.startTime) / 1000);
        setLiveTime({
          minutes: Math.floor(diff / 60),
          seconds: diff % 60,
        });
      }, 1000);
    } else {
      setLiveTime({ minutes: 0, seconds: 0 });
    }

    return () => clearInterval(timer);
  }, [myData?.step, myData?.startTime]);

  /* =========================
      WARNA STATUS
  ========================== */
  const getColor = (step) => {
    if (step === 2) return "bg-blue-500";
    if (step === 1) return "bg-yellow-400";
    return "bg-gray-400";
  };

  /* =========================
      HITUNG DURASI
  ========================== */
  const calcDuration = (start) => {
    const diff = Math.floor((Date.now() - start) / 1000);
    return {
      minutes: Math.floor(diff / 60),
      seconds: diff % 60,
    };
  };

  /* =========================
      FLOW TOMBOL UTAMA
      Abu → Kuning (START)
      Kuning → Biru (LANJUT)
      Biru → Abu (STOP + LOG)
  ========================== */
  const handleClick = () => {
    if (!myData) return;

    let { batch, group, step, startTime = null } = myData;
    const now = Date.now();

    if (step === 0) {
      step = 1;
      startTime = now;
    } 
    else if (step === 1) {
      step = 2;
    } 
    else if (step === 2) {
      if (startTime) {
        const duration = calcDuration(startTime);
        set(ref(db, `logs/${key}/batch${batch}/group${group}`), { duration });
      }

      startTime = null;
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
  const previousGroup = () => {
    if (!myData) return;

    let { batch, group } = myData;

    group--;
    if (group < 1) {
      batch = Math.max(1, batch - 1);
      group = 3;
    }

    set(ref(db, `wahana/${key}`), {
      ...myData,
      batch,
      group,
      step: 0,
      startTime: null,
    });
  };

  const resetWrongClick = () => {
    if (!myData) return;

    set(ref(db, `wahana/${key}`), {
      ...myData,
      step: 0,
      startTime: null,
    });
  };

  /* =========================
      UI
  ========================== */
  const getStatusIcon = (step) => {
    if (step === 2) return <StatusReadyIcon className="w-6 h-6 text-white" />;
    if (step === 1) return <StatusActiveIcon className="w-6 h-6 text-black" />;
    return <StatusIdleIcon className="w-6 h-6" />;
  };

  const getMainButtonIcon = () => {
    if (myData?.step === 0) return <PlayIcon className="w-12 h-12 md:w-16 md:h-16 text-gray-600" />;
    if (myData?.step === 1) return <PauseIcon className="w-12 h-12 md:w-16 md:h-16 text-black" />;
    if (myData?.step === 2) return <StopIcon className="w-12 h-12 md:w-16 md:h-16 text-white" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col items-center justify-center px-4 py-6 md:py-8 safe-top safe-bottom">
      
      {/* Header Section */}
      <div className="text-center mb-6 md:mb-8 fade-in">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 text-yellow-400">
          {WAHANA[id]}
        </h1>
        {myData && (
          <div className="flex items-center justify-center gap-2 mt-2 fade-in-delay-1">
            <ClockIcon className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
            <p className="text-base md:text-lg text-yellow-400 font-semibold">
              Batch {myData.batch} • Group {myData.group}
            </p>
          </div>
        )}
      </div>

      {/* STATUS 8 WAHANA - Responsive Grid */}
      <div className="w-full max-w-4xl mb-8 md:mb-12 fade-in-delay-2">
        <h2 className="text-sm md:text-base font-semibold mb-4 text-center text-gray-400 uppercase tracking-wide">
          Status Semua Wahana
        </h2>
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4 lg:gap-6">
          {[1,2,3,4,5,6,7,8].map((i, index) => {
            const data = allWahana[`wahana${i}`];
            return (
              <div 
                key={i} 
                className="flex flex-col items-center text-center stagger-item transform transition-all duration-300 hover:scale-110"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {data && (
                  <div className="text-[10px] md:text-xs text-yellow-400 mb-1.5 font-semibold">
                    B{data.batch} • G{data.group}
                  </div>
                )}
                <div 
                  className={`w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full ${getColor(data?.step)} shadow-lg transition-all duration-300 relative overflow-hidden ${
                    data?.step > 0 ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-yellow-400/50 status-pulse' : ''
                  }`} 
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    {getStatusIcon(data?.step)}
                  </div>
                </div>
                <span className="text-[10px] md:text-xs lg:text-sm mt-2 opacity-90 font-medium leading-tight transition-opacity duration-300">
                  {WAHANA[i]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* TOMBOL UTAMA - Larger for mobile touch */}
      <div className="mb-8 md:mb-10 scale-in">
        <div className="relative">
          <button
            onClick={handleClick}
            className={`w-32 h-32 md:w-40 md:h-40 lg:w-44 lg:h-44 rounded-full flex items-center justify-center font-bold shadow-2xl transition-all duration-300 active:scale-95 hover:scale-105 relative overflow-hidden group ${
              getColor(myData?.step)
            } ${
              (myData?.step === 1 || myData?.step === 2) ? 'pulse-timer glow-effect' : ''
            }`}
          >
            {/* Background shimmer effect */}
            <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {(myData?.step === 1 || myData?.step === 2) ? (
              <div className="relative z-10 flex flex-col items-center gap-1">
                <ClockIcon className={`w-6 h-6 md:w-8 md:h-8 ${myData.step === 2 ? "text-white" : "text-black"} animate-pulse`} />
                <span className={`text-xl md:text-2xl lg:text-3xl font-mono font-bold ${myData.step === 2 ? "text-white" : "text-black"}`}>
                  {String(liveTime.minutes).padStart(2,"0")}:
                  {String(liveTime.seconds).padStart(2,"0")}
                </span>
              </div>
            ) : (
              <div className="relative z-10 flex flex-col items-center gap-2">
                {getMainButtonIcon()}
                <span className="text-gray-600 text-xs md:text-sm font-semibold">START</span>
              </div>
            )}
          </button>
          
          {/* Outer glow ring */}
          {(myData?.step === 1 || myData?.step === 2) && (
            <div className={`absolute inset-0 rounded-full ${getColor(myData?.step)} opacity-30 blur-xl animate-ping`}></div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full max-w-md mb-6 fade-in-delay-3">
        <button
          onClick={previousGroup}
          className="px-6 md:px-8 py-3 md:py-4 rounded-xl bg-gray-700 hover:bg-gray-600 text-sm md:text-base font-bold transition-all duration-300 shadow-lg active:scale-95 flex-1 flex items-center justify-center gap-2 group hover:scale-105"
        >
          <ArrowLeftIcon className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform duration-300" />
          <span>Previous</span>
        </button>

        <button
          onClick={resetWrongClick}
          className="px-6 md:px-8 py-3 md:py-4 rounded-xl bg-red-600 hover:bg-red-700 text-sm md:text-base font-bold transition-all duration-300 shadow-lg active:scale-95 flex-1 flex items-center justify-center gap-2 group hover:scale-105"
        >
          <ResetIcon className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-180 transition-transform duration-300" />
          <span>Reset Salah Klik</span>
        </button>
      </div>

      {/* Info Text */}
      <div className="mt-4 text-xs md:text-sm opacity-70 text-center max-w-md px-4 fade-in-delay-4">
        <p className="mb-2 flex items-center justify-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-yellow-400 mr-1 bounce-animation"></span>
          <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
          <span>Timer berjalan</span>
        </p>
        <p className="flex items-center justify-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-gray-400 mr-1"></span>
          <span>Timer berhenti</span>
        </p>
      </div>
    </div>
  );
}
