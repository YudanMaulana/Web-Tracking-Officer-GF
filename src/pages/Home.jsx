import { useNavigate } from "react-router-dom";
import { ref, set } from "firebase/database";
import { db } from "../firebase";
import { OFFICERS } from "../constants/officers";

export default function Home() {
  const navigate = useNavigate();


  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-6">
      <h1 className="text-3xl font-bold mb-10">
        PILIH OFFICER
      </h1>

      {/* 🔵 TOMBOL OFFICER */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {Object.keys(OFFICERS).map((id) => (
          <button
            key={id}
            onClick={() => navigate(`/officer/${id}`)}
            className="bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-bold"
          >
            {OFFICERS[id]}
          </button>
        ))}
      </div>
      {/* 👁 MODE MONITOR */}
      <button
        onClick={() => navigate("/monitor")}
        className="
          mt-6 w-full max-w-md py-5 rounded-2xl
          border-2 border-green-400
          text-green-400 font-bold text-lg
          hover:bg-green-500 hover:text-black
          transition
        "
      >
        👁 MODE MONITOR (LEADER)
      </button>
    </div>
  );
}
