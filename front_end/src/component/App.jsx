import { Outlet } from "react-router-dom";
import SideBar from "./SideBar";

const App = () => {
  return (
    <div className="flex">
      <nav className="flex-[1]">
        <SideBar />
      </nav>
      <main className="flex-[5]">
        <Outlet />
      </main>
    </div>
  );
};

export default App;
