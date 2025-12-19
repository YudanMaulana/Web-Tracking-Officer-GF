import { ref, onValue, update, set } from "firebase/database";
import { useEffect, useState } from "react";
import { db } from "../firebase";

const WAHANA_LIST = {
  wahana1: "Hologram",
  wahana2: "Train 1",
  wahana3: "Dream Farm",
  wahana4: "Space-X",
  wahana5: "Train 2",
  wahana6: "Tunel",
  wahana7: "Chamber AI & B.Gondola",
  wahana8: "Gondola",
};

export default function Developer() {
  const [allWahana, setAllWahana] = useState({});
  const [selected, setSelected] = useState("wahana1");
  const [batch, setBatch] = useState(1);
  const [group, setGroup] = useState(1);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  /* =========================
      LOAD DATA
  ========================== */
  useEffect(() => {
    const unsub = onValue(ref(db, "wahana"), (snap) => {
      setAllWahana(snap.val() || {});
    });
    return () => unsub();
  }, []);

  /* =========================
      SET POSISI MANUAL
  ========================== */
  const setPosition = () => {
    set(ref(db, `wahana/${selected}`), {
      batch: Number(batch),
      group: Number(group),
      step: 0,
      startTime: null,
    });
  };

  /* =========================
      RESET SALAH KLIK
  ========================== */
  const resetWrongClick = () => {
    const data = allWahana[selected];
    if (!data) return;

    set(ref(db, `wahana/${selected}`), {
      ...data,
      step: 0,
      startTime: null,
    });
  };

  /* =========================
      SET MENIT & DETIK MANUAL
  ========================== */
  const setManualTime = () => {
    update(
      ref(
        db,
        `logs/${selected}/batch${batch}/group${group}/duration`
      ),
      {
        minutes: Number(minutes),
        seconds: Number(seconds),
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-10">
      <h1 className="text-2xl font-bold text-center mb-10 text-yellow-400">
        Developer Mode
      </h1>

      <div className="max-w-xl mx-auto bg-gray-800 rounded-xl p-6 space-y-8">

        {/* PILIH WAHANA */}
        <div>
          <label className="block text-sm mb-1">Pilih Wahana</label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full p-2 rounded bg-gray-700"
          >
            {Object.keys(WAHANA_LIST).map((key) => (
              <option key={key} value={key}>
                {WAHANA_LIST[key]}
              </option>
            ))}
          </select>
        </div>

        {/* SET BATCH & GROUP */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Batch</label>
            <input
              type="number"
              min="1"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              className="w-full p-2 rounded bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Group</label>
            <input
              type="number"
              min="1"
              max="3"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              className="w-full p-2 rounded bg-gray-700"
            />
          </div>
        </div>

        <button
          onClick={setPosition}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold"
        >
          SET POSISI
        </button>

        {/* RESET */}
        <button
          onClick={resetWrongClick}
          className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 font-bold"
        >
          RESET SALAH KLIK
        </button>

        {/* SET WAKTU */}
        <div className="border-t border-gray-700 pt-6">
          <h2 className="text-center font-bold text-yellow-400 mb-4">
            Set Waktu Manual
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm mb-1">Menit</label>
              <input
                type="number"
                min="0"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="w-full p-2 rounded bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Detik</label>
              <input
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
                className="w-full p-2 rounded bg-gray-700"
              />
            </div>
          </div>

          <button
            onClick={setManualTime}
            className="w-full py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold"
          >
            SET WAKTU
          </button>
        </div>
      </div>
    </div>
  );
}
