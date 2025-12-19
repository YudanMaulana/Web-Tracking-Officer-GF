import { Link } from "react-router-dom";

export default function Home() {
  const btn = "bg-gray-700 px-6 py-3 rounded text-center hover:bg-gray-600";

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-bold">Pilih Wahana</h1>

      <div className="grid grid-cols-2 gap-4">
        <Link to="/officer/1" className={btn}>Hologram</Link>
        <Link to="/officer/train" className={btn}>Train 1 & 2</Link>
        <Link to="/officer/3" className={btn}>Dream Farm</Link>
        <Link to="/officer/4" className={btn}>Space-X</Link>
        <Link to="/officer/6" className={btn}>Tunel</Link>
        <Link to="/officer/7" className={btn}>Chamber AI</Link>
        <Link to="/officer/8" className={btn}>Gondola</Link>
      </div>

      <div className="flex gap-3 mt-6">
        <Link
          to="/monitor"
          className="bg-blue-600 px-6 py-3 rounded font-bold text-center"
        >
          MODE MONITOR
        </Link>

        <Link
          to="/developer"
          className="bg-yellow-500 hover:bg-yellow-400 px-6 py-3 rounded font-bold text-black text-center"
        >
          DEVELOPER
        </Link>
      </div>

    </div>
  );
}
