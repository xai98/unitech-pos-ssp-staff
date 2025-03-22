import { Outlet } from "react-router-dom";

import routes from "../utils/routes";
import ReportDashboard from "../pages/report/ReportDashboard";
import HomeMobile from "../pages/mobile/HomeMobile";


// eslint-disable-next-line
export default {
    path: "/",
    element: <Outlet />,
    children: [
        {
            path: routes.REPORT_DASHBOARD,
            element: <ReportDashboard />,
        },
        {
            path: routes.HOME_MOBILE,
            element: <HomeMobile />,
        },
    ],
};

