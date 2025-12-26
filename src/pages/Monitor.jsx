import { ref, onValue, update, remove } from "firebase/database";
import { useEffect, useState } from "react";
import { db } from "../firebase";

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

      const batches = logs[wahanaKey];
      Object.keys(batches).forEach((batchKey) => {
        const batchNumber = batchKey.replace("batch", "");
        const groups = batches[batchKey];

        Object.keys(groups).forEach((groupKey) => {
          const groupNumber = groupKey.replace("group", "");
          const duration = groups[groupKey]?.duration;

          if (duration) {
            csv += `${wahanaName},${batchNumber},${groupNumber},${duration.minutes},${duration.seconds}\n`;
          }
        });
      });
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "monitor_wahana.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Monitor Progress Wahana
      </h1>

      <div className="space-y-6">
        {[1,2,3,4,5,6,7,8].map((i) => {
          const wahanaLogs = logs[`wahana${i}`] || {};

          return (
            <div key={i} className="bg-gray-800 rounded-xl p-4">
              <h2 className="font-bold text-lg mb-3 text-yellow-400">
                {WAHANA[i]}
              </h2>

              {/* 🔁 BATCH 1–5 */}
{[1,2,3,4,5].map((batch) => (
  <div key={batch} className="mb-2">
    <div className="font-semibold text-sm mb-1">
      Batch {batch}
    </div>

    <div className="grid grid-cols-3 gap-2 text-xs">
      {[1,2,3].map((group) => {
        const duration =
          wahanaLogs?.[`batch${batch}`]?.[`group${group}`]?.duration;

        const minutes =
          duration?.minutes != null
            ? String(duration.minutes).padStart(2, "0")
            : "--";

        const seconds =
          duration?.seconds != null
            ? String(duration.seconds).padStart(2, "0")
            : "--";

        return (
          <div
            key={group}
            className="bg-gray-700 rounded-md px-2 py-1 text-center"
          >
            Group {group}
            <br />
            <span className="text-yellow-300">
              {minutes}:{seconds}
            </span>
          </div>
        );
      })}
    </div>
  </div>
))}

            </div>
          );
        })}
      </div>

      {/* ACTION BUTTON */}
      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={downloadCSV}
          className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 font-bold"
        >
          Unduh Data
        </button>

        <button
          onClick={resetAll}
          className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 font-bold"
        >
          Reset Semua Batch & Group
        </button>
      </div>
    </div>
  );
}
