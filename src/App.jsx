import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Bouquet from "./pages/Bouquet";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Bouquet />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
