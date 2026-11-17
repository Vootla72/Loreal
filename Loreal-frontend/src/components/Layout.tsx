
import { Outlet } from "react-router-dom";
import {Sidebar} from "./SideBar";
import {Header} from "./Header";
import {ScrollToTop} from "./ScrollToTop";

export const Layout = () => {
  return (
    <div className="app">
      <ScrollToTop />

      <Sidebar />

      <main className="main-content">
        <Header />
        <Outlet />
      </main>
    </div>
  );
};

