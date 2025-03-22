import { Outlet } from "react-router-dom";

import routes from "../utils/routes";
import PosPage from "../pages/pos/PosPage";
import ChangeProduct from "../pages/pos/ChangeProduct";
import PosMobilePage from "../pages/mobile/posMobile/PosMobilePage";
import BillMobile from "../pages/mobile/posMobile/BillMobile";


// eslint-disable-next-line
export default {
    path: "/",
    element: <Outlet />,
    children: [
        {
            path: routes.POS_SALE,
            element: <PosPage />,
        },
        {
            path: routes.CHANGE_PRODUCT + "/:orderId",
            element: <ChangeProduct />,
        },
        {
            path: routes.POS_MOBILE_PAGE,
            element: <PosMobilePage />,
        },
        {
            path: routes.BILL_MOBILE_PAGE +"/:orderId",
            element: <BillMobile />,
        },
    ],
};

