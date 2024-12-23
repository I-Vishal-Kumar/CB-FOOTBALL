import { useContext } from "react";
import Footer from "./Footer";
import Modal from "./Modal";
import { AlertContext } from "../helpers/AlertContext";

const Layout = ({ children }) => {
  let { isActive } = useContext(AlertContext);
  return (
    <div className="min-h-screen">
      <main>{children}</main>
      <Footer />
      {isActive && <Modal />}
    </div>
  );
};

export default Layout;
