import { useEffect, useState } from "react";
import { ref, onValue, set } from "firebase/database";
import { db } from "../firebase";
import { OFFICERS } from "../constants/officers";

export default function Monitor() {
  const [logs, setLogs] = useState({});

  useEffect(() => {
    onValue(ref(db, "logs"), (snap) => {
      setLogs(snap.val() || {});
    });
  }, []);

  const handleReset = () => {
    if (
      !window.confirm(
        "RESET SEMUA DATA?\n\nBatch, group, dan timing akan dihapus."
      )
    ) return;

    // 🔴 RESET WAHANA
    const resetWahana = {};
    for (let i = 1; i <= 7; i++) {
      resetWahana[`wahana${i}`] = {
        officer: OFFICERS[i],
        batch: 1,
        group: 1,
        step: 0,
        startTime: null
      };
    }

    // overwrite database
    set(ref(db), {
      wahana: resetWahana,
      logs: {}
    });
  };

  const renderOfficer = (id) => {
    const officerLogs = logs[`wahana${id}`] || {};

    return (
      <div
        key={id}
        className="bg-gray-800 rounded-xl p-4 mb-6"
      >
        <h2 className="text-lg font-bold mb-2">
          {OFFICERS[id]}
        </h2>

        {[1, 2, 3, 4].map((batch) => {
          const batchData = officerLogs[`batch${batch}`];
          if (!batchData) return null;

          return (
            <div key={batch} className="mb-3">
              <p className="font-semibold text-sm text-blue-400">
                Batch {batch}
              </p>

              {[1, 2, 3].map((group) => {
                const dur =
                  batchData[`group${group}`]?.duration;

                if (!dur) return null;

                return (
                  <p
                    key={group}
                    className="text-sm ml-4 opacity-80"
                  >
                    Group {group} : {dur.minutes}m {dur.seconds}s
                  </p>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-8">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Monitor Proses Wahana
      </h1>

      {/* 🔴 TOMBOL RESET */}
      <div className="flex justify-center mb-8">
        <button
          onClick={handleReset}
          className="bg-red-600 hover:bg-red-700
          px-6 py-3 rounded-xl font-bold"
        >
          RESET BATCH & GROUP
        </button>
      </div>

      {Array.from({ length: 7 }, (_, i) =>
        renderOfficer(i + 1)
      )}
    </div>
  );
}
