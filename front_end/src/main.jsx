import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./component/App.jsx";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import DashBoard from "./pages/DashBoard.jsx";
import Movies from "./pages/Movies.jsx";
import Rooms from "./pages/Rooms.jsx";
import Showtime from "./pages/Showtime.jsx";
import Tickets from "./pages/Tickets.jsx";
import Products from "./pages/Products.jsx";
import Orders from "./pages/Orders.jsx";
import Promotions from "./pages/Promotions.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<DashBoard />} />
          <Route path="dashboard" element={<DashBoard />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/showtime" element={<Showtime />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/products" element={<Products />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/promotions" element={<Promotions />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
