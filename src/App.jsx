import { BrowserRouter, Routes, Route } from "react-router-dom";
import Bouquet from "./pages/Bouquet";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Bouquet />} />
      </Routes>
    </BrowserRouter>
  );
}
