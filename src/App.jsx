import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import Home from "./pages/Home";
import Officer from "./pages/Officer";
import Train from "./pages/Train";
import Monitor from "./pages/Monitor";
import Developer from "./pages/Developer";
import Login from "./pages/Login";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Set loading to false when the authentication state is determined
    });

    return () => unsubscribe();
  }, []);

  // Halaman yang dilindungi harus memeriksa status autentikasi
  const ProtectedRoute = ({ element }) => {
    if (loading) return <div>Loading...</div>; // Loading state while checking auth
    return user ? element : <Navigate to="/login" />; // Redirect to login if user is not authenticated
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/officer/:id" element={<ProtectedRoute element={<Officer />} />} />
        <Route path="/officer/train" element={<ProtectedRoute element={<Train />} />} />
        <Route path="/monitor" element={<ProtectedRoute element={<Monitor />} />} />
        <Route path="/developer" element={<ProtectedRoute element={<Developer />} />} />
      </Routes>
    </BrowserRouter>
  );
}
