import { useParams } from "react-router-dom";
import { ref, onValue, set } from "firebase/database";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { OFFICERS } from "../constants/officers";

export default function Officer() {
  const { id } = useParams();
  const key = `wahana${id}`;

  const [allWahana, setAllWahana] = useState({});
  const myData = allWahana[key];

  useEffect(() => {
    onValue(ref(db, "wahana"), (snap) => {
      setAllWahana(snap.val() || {});
    });
  }, []);

  const handleClick = () => {
    if (!myData) return;

    let { batch, group, step, startTime } = myData;
    const now = Date.now();

    // 🟡 MULAI (idle → proses)
    if (step === 0) {
      set(ref(db, `wahana/${key}`), {
        batch,
        group,
        step: 1,
        startTime: now
      });
      return;
    }

    // 🟡 PROSES
    if (step === 1) step = 2;
    else if (step === 2) step = 3;

    // 🔵 SELESAI (step 3 → idle)
    else if (step === 3) {
      const diffMs = now - startTime;
      const totalSeconds = Math.floor(diffMs / 1000);

      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      // simpan log
      set(
        ref(db, `logs/${key}/batch${batch}/group${group}`),
        {
          duration: { minutes, seconds }
        }
      );

      // lanjut batch & group
      step = 0;
      group++;

      if (group > 3) {
        group = 1;
        batch++;
      }

      startTime = null;
    }

    set(ref(db, `wahana/${key}`), {
      batch,
      group,
      step,
      startTime
    });
  };

  const getColor = (step) => {
    if (step === 3) return "bg-blue-500";
    if (step > 0) return "bg-yellow-400";
    return "bg-gray-400";
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-bold mb-2">
        {OFFICERS[id]}
      </h1>

      {myData && (
        <p className="text-sm opacity-70 mb-8">
          Batch {myData.batch} • Group {myData.group}
        </p>
      )}

      {/* STATUS OFFICER LAIN */}
      <div className="flex gap-8 mb-12">
        {[1,2,3,4,5,6,7].map((i) => {
          const data = allWahana[`wahana${i}`];
          return (
            <div key={i} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center
                text-sm font-bold text-black ${getColor(data?.step)}`}
              >
                {data?.step > 0 && data.step}
              </div>
              <span className="text-[13px] mt-1 opacity-80 text-center">
                {OFFICERS[i]}
              </span>
            </div>
          );
        })}
      </div>

      {/* TOMBOL UTAMA */}
      <button
        onClick={handleClick}
        className={`w-40 h-40 rounded-full flex items-center justify-center
        text-5xl font-bold text-black ${getColor(myData?.step)}`}
      >
        {myData?.step > 0 && myData.step}
      </button>

      <p className="mt-6 text-xs opacity-60 text-center">
        Durasi dicatat sampai detik
      </p>
    </div>
  );
}
