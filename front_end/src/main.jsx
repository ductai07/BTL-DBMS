import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./component/App.jsx";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import DashBoard from "./pages/DashBoard.jsx";
import Movies from "./pages/Movies.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<DashBoard />} />
          <Route path="dashboard" element={<DashBoard />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/rooms" />
          <Route path="/showtimes" />
          <Route path="/tickets" />
          <Route path="/products" />
          <Route path="/orders" />
          <Route path="/promotions" />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
