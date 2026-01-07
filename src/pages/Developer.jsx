import { ref, onValue, update, set } from "firebase/database";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  SettingsIcon,
  ResetIcon,
  ClockIcon,
  AlertIcon,
} from "../components/Icons";

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
      HAPUS DATA BATCH & GROUP
  ========================== */
  /* =========================
      HAPUS DATA BATCH & GROUP
========================== */
const deleteBatchGroup = () => {
  const data = allWahana[selected];
  if (!data) return;

  // Menghapus data durasi (menit dan detik) untuk batch dan group yang dipilih
  const pathToDuration = `logs/${selected}/batch${batch}/group${group}/duration`;

  // Menghapus data waktu
  update(ref(db, pathToDuration), {
    minutes: null, // Menghapus data waktu
    seconds: null,
  })
    .then(() => {
      console.log('Data waktu berhasil dihapus');
    })
    .catch((error) => {
      console.error('Gagal menghapus data waktu:', error);
    });
};


  /* =========================
      SET MENIT & DETIK MANUAL
  ========================== */
  const setManualTime = () => {
    update(
      ref(db, `logs/${selected}/batch${batch}/group${group}/duration`),
      {
        minutes: Number(minutes),
        seconds: Number(seconds),
      }
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-4 md:px-6 py-6 md:py-10 safe-top safe-bottom">
      {/* Header */}
      <div className="text-center mb-8 md:mb-10 fade-in">
        <div className="flex items-center justify-center gap-3 mb-2">
          <SettingsIcon className="w-8 h-8 md:w-10 md:h-10 text-yellow-400 icon-hover rotate-icon" />
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-yellow-400">
            Developer Mode
          </h1>
        </div>
        <p className="text-sm md:text-base text-gray-400 fade-in-delay-1">
          Kontrol dan Konfigurasi Manual
        </p>
      </div>

      <div className="max-w-2xl mx-auto bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 md:p-8 lg:p-10 space-y-6 md:space-y-8 shadow-2xl border border-gray-700/50 scale-in">
        {/* PILIH WAHANA */}
        <div className="fade-in-delay-2">
          <label className="flex items-center gap-2 text-sm md:text-base font-semibold mb-2 text-gray-300">
            <AlertIcon className="w-4 h-4 text-yellow-400" />
            Pilih Wahana
          </label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full p-3 md:p-4 rounded-xl bg-gray-700 hover:bg-gray-600 border border-gray-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50 text-base transition-all duration-300 transform hover:scale-[1.02]"
          >
            {Object.keys(WAHANA_LIST).map((key) => (
              <option key={key} value={key}>
                {WAHANA_LIST[key]}
              </option>
            ))}
          </select>
        </div>

        {/* SET BATCH & GROUP */}
        <div className="grid grid-cols-2 gap-4 md:gap-6 fade-in-delay-3">
          <div>
            <label className="block text-sm md:text-base font-semibold mb-2 text-gray-300">
              Batch
            </label>
            <input
              type="number"
              min="1"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              className="w-full p-3 md:p-4 rounded-xl bg-gray-700 hover:bg-gray-600 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 text-base transition-all duration-300 transform hover:scale-[1.02]"
            />
          </div>

          <div>
            <label className="block text-sm md:text-base font-semibold mb-2 text-gray-300">
              Group
            </label>
            <input
              type="number"
              min="1"
              max="3"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              className="w-full p-3 md:p-4 rounded-xl bg-gray-700 hover:bg-gray-600 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 text-base transition-all duration-300 transform hover:scale-[1.02]"
            />
          </div>
        </div>

        <button
          onClick={setPosition}
          className="w-full py-3 md:py-4 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-base md:text-lg transition-all duration-300 shadow-lg active:scale-95 hover:scale-105 flex items-center justify-center gap-2 group"
        >
          <SettingsIcon className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span>SET POSISI</span>
        </button>

        {/* HAPUS DATA */}
        <button
          onClick={deleteBatchGroup}
          className="w-full py-3 md:py-4 rounded-xl bg-red-600 hover:bg-red-700 font-bold text-base md:text-lg transition-all duration-300 shadow-lg active:scale-95 hover:scale-105 flex items-center justify-center gap-2 group"
        >
          <ResetIcon className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
          <span>HAPUS DATA</span>
        </button>

        {/* SET WAKTU */}
        <div className="border-t border-gray-700 pt-6 md:pt-8 fade-in-delay-4">
          <div className="flex items-center justify-center gap-2 mb-6">
            <ClockIcon className="w-6 h-6 text-yellow-400" />
            <h2 className="text-center font-bold text-lg md:text-xl text-yellow-400">
              Set Waktu Manual
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 md:gap-6 mb-6">
            <div>
              <label className="block text-sm md:text-base font-semibold mb-2 text-gray-300">
                Menit
              </label>
              <input
                type="number"
                min="0"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="w-full p-3 md:p-4 rounded-xl bg-gray-700 hover:bg-gray-600 border border-gray-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50 text-base transition-all duration-300 transform hover:scale-[1.02]"
              />
            </div>

            <div>
              <label className="block text-sm md:text-base font-semibold mb-2 text-gray-300">
                Detik
              </label>
              <input
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
                className="w-full p-3 md:p-4 rounded-xl bg-gray-700 hover:bg-gray-600 border border-gray-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50 text-base transition-all duration-300 transform hover:scale-[1.02]"
              />
            </div>
          </div>

          <button
            onClick={setManualTime}
            className="w-full py-3 md:py-4 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-base md:text-lg transition-all duration-300 shadow-lg active:scale-95 hover:scale-105 flex items-center justify-center gap-2 group"
          >
            <ClockIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            <span>SET WAKTU</span>
          </button>
        </div>
      </div>
    </div>
  );
}
