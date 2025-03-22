// Router.tsx
import { useRoutes } from "react-router-dom";
import PrivateRoute from './PrivateRoute'
import PosRoutes from "./Pos.routes";
import StockRoutes from "./Stock.routes";
import ReportRoutes from "./Report.routes";
import AccountRoutes from "./Account.routes";

import LoginPage from "../pages/login/LoginPage";
import { AuthProvider } from "../hooks/AuthContext";

function Router() {
  return (
    <AuthProvider>
      {useRoutes([
        {
          path: "/",
          element: <PrivateRoute />,
          children: [
            PosRoutes,
            StockRoutes,
            ReportRoutes,
            AccountRoutes,
          ],
        },
        {
          path: "login",
          element: <LoginPage />,
        },
        {
          path: "*",
          element: <h1>404 page</h1>,
        },
      ])}
    </AuthProvider>
  );
}

export default Router;
