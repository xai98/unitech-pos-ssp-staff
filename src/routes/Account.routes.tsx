import { Outlet } from "react-router-dom";

import routes from "../utils/routes";
import AccountPage from "../pages/account/AccountPage";

// eslint-disable-next-line
export default {
    path: "/",
    element: <Outlet />,
    children: [
        {
            path: routes.ACCOUNG_PAGE,
            element: <AccountPage />,
        },
    ],
};

