import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Officer from "./pages/Officer";
import Train from "./pages/Train";
import Monitor from "./pages/Monitor";
import Developer from "./pages/Develpoer";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/officer/:id" element={<Officer />} />
        <Route path="/officer/train" element={<Train />} />
        <Route path="/monitor" element={<Monitor />} />
        <Route path="/developer" element={<Developer />} />
      </Routes>
    </BrowserRouter>
  );
}
