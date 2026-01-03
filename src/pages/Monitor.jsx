import { ref, onValue, update, remove } from "firebase/database";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  MonitorIcon,
  DownloadIcon,
  ResetIcon,
  ClockIcon,
  StatusActiveIcon,
  StatusIdleIcon,
  StatusReadyIcon,
} from "../components/Icons";

/* =========================
   NAMA WAHANA
========================= */
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

/* =========================
   TARGET MENIT
========================= */
const TARGET_MINUTES = {
  1: 23, // Hologram
  2: 5,  // Train 1
  3: 13, // Dream Farm
  4: 14, // Space-X
  5: 4,  // Train 2
  6: 15, // Tunel
  7: 5,  // Chamber AI & B.Gondola
  8: 10, // Gondola
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
      const idx = wahanaKey.replace("wahana", "");
      const name = WAHANA[idx];

      Object.keys(logs[wahanaKey] || {}).forEach((batchKey) => {
        Object.keys(logs[wahanaKey][batchKey] || {}).forEach((groupKey) => {
          const d = logs[wahanaKey][batchKey][groupKey]?.duration;
          if (d) {
            csv += `${name},${batchKey.replace("batch","")},${groupKey.replace("group","")},${d.minutes},${d.seconds}\n`;
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

  /* =========================
      HITUNG SELISIH TARGET
  ========================== */
  const getDiff = (wahanaId, minutes) => {
    const target = TARGET_MINUTES[wahanaId];
    if (minutes == null) return null;
    return minutes - target; // (+) lebih lama, (-) lebih cepat
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-6 safe-top safe-bottom">

      {/* HEADER */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <MonitorIcon className="w-8 h-8 text-yellow-400" />
          <h1 className="text-2xl md:text-3xl font-bold text-yellow-400">
            Monitor Progress Wahana
          </h1>
        </div>
        <p className="text-sm text-gray-400">
          Perbandingan waktu aktual vs target
        </p>
      </div>

      {/* STATUS BULATAN */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-4 mb-10">
        {[1,2,3,4,5,6,7,8].map((i) => {
          const data = wahana[`wahana${i}`];
          return (
            <div key={i} className="flex flex-col items-center text-center">
              <div className={`w-10 h-10 rounded-full ${getColor(data?.step)} flex items-center justify-center`}>
                {getStatusIcon(data?.step)}
              </div>
              <span className="text-xs text-yellow-400 mt-2">{WAHANA[i]}</span>
              {data && (
                <span className="text-[10px] text-yellow-300">
                  B{data.batch} • G{data.group}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* LIST TIMING */}
      <div className="space-y-6 mb-10">
        {[1,2,3,4,5,6,7,8].map((i) => {
          const wahanaLogs = logs[`wahana${i}`] || {};
          return (
            <div key={i} className="bg-gray-800 rounded-xl p-4">
              <h2 className="text-yellow-400 font-bold mb-4">
                {WAHANA[i]} (Target {TARGET_MINUTES[i]} m)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[1,2,3,4,5].map((batch) => (
                  <div key={batch} className="bg-gray-700 rounded-lg p-3">
                    <div className="text-blue-400 font-semibold mb-2">
                      Batch {batch}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {[1,2,3].map((group) => {
                        const d = wahanaLogs?.[`batch${batch}`]?.[`group${group}`]?.duration;
                        const m = d?.minutes;
                        const s = d?.seconds;
                        const diff = getDiff(i, m);

                        return (
                          <div key={group} className="bg-gray-600 rounded-md p-2 text-center">
                            <div className="text-gray-400 mb-1">G{group}</div>

                            {d ? (
                              <div className="flex items-center justify-between font-mono font-bold">
                                {/* LEBIH CEPAT */}
                                <span className="text-green-400 text-[10px]">
                                  {diff < 0 ? `${Math.abs(diff)}m` : ""}
                                </span>

                                {/* AKTUAL */}
                                <span className="text-yellow-300">
                                  {String(m).padStart(2,"0")}:
                                  {String(s).padStart(2,"0")}
                                </span>

                                {/* LEBIH LAMA */}
                                <span className="text-red-400 text-[10px]">
                                  {diff > 0 ? `+${diff}m` : ""}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400">--:--</span>
                            )}
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

      {/* ACTION */}
      <div className="flex gap-4 max-w-md mx-auto">
        <button
          onClick={downloadCSV}
          className="flex-1 bg-green-600 py-3 rounded-xl font-bold"
        >
          Unduh Data
        </button>
        <button
          onClick={resetAll}
          className="flex-1 bg-red-600 py-3 rounded-xl font-bold"
        >
          Reset Semua
        </button>
      </div>
    </div>
  );
}
