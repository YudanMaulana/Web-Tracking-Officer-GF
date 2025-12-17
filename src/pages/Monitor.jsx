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

  // 🔄 reset SEMUA batch, group, step, timing
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
  const formatTime = (minutes, seconds) => {
  if (minutes === "--" || seconds === "--") return "--:--";

  return (
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0")
  );
};


  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Monitor Progress Wahana
      </h1>

      <div className="space-y-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
          const wahanaLogs = logs[`wahana${i}`] || {};

          return (
            <div key={i} className="bg-gray-800 rounded-xl p-4">
              <h2 className="font-bold text-lg mb-3 text-yellow-400">
                {WAHANA[i]}
              </h2>

              {[1, 2, 3, 4].map((batch) => (
                <div key={batch} className="mb-2">
                  <div className="font-semibold text-sm mb-1">
                    Batch {batch}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {[1, 2, 3].map((group) => {
                      const duration =
                        wahanaLogs?.[`batch${batch}`]?.[`group${group}`]
                          ?.duration;

                      const minutes = duration?.minutes ?? "--";
                      const seconds = duration?.seconds ?? "--";

                      return (
                        <div
                          key={group}
                          className="bg-gray-700 rounded-md px-2 py-1 text-center"
                        >
                          Group {group}
                          <br />
                          <span className="text-yellow-300">
                            {formatTime(minutes, seconds)}
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

      {/* RESET */}
      <div className="flex justify-center mt-8">
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
