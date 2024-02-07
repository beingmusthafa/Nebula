import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";

const HideAuth = () => {
  const { currentUser } = useSelector((state: any) => state.user);
  return currentUser ? <Navigate to="/" /> : <Outlet />;
};

export default HideAuth;
