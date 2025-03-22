import { Outlet } from "react-router-dom";

import routes from "../utils/routes";
import StockList from "../pages/stocks/StockList";
import HistoryStockList from "../pages/historyStock/HistoryStockList";
import RequestStock from "../pages/stocks/RequestStock";
import RequestStockPage from "../pages/requestStock/RequestStockPage";
import RequestStockDetail from "../pages/requestStock/RequestStockDetail";
import AddRequestStock from "../pages/requestStock/AddRequestStock";
import BranchStockPage from "../pages/stocks/BranchStockPage";
import HistoryBranchStockPage from "../pages/historyStock/HistoryBranchStockPage";


// eslint-disable-next-line
export default {
    path: "/",
    element: <Outlet />,
    children: [
        {
            path: routes.STOCK_LIST,
            element: <StockList />,
        },
        {
            path: routes.BRANCH_STOCK_LIST,
            element: <BranchStockPage />,
        },
        {
            path: routes.HISTORY_STOCK_LIST,
            element: <HistoryStockList />,
        },
        {
            path: routes.HISTORY_BRANCH_STOCK_LIST,
            element: <HistoryBranchStockPage />,
        },
        {
            path: routes.REQUEST_STOCK_PAGE,
            element: <RequestStock />,
        },
        {
            path: routes.HISTORY_REQUEST_STOCK_PAGE,
            element: <RequestStockPage />,
        },
        {
            path: routes.HISTORY_REQUEST_STOCK_DETAIL + "/:requestId",
            element: <RequestStockDetail />,
        },
        {
            path: routes.ADD_REQUEST_STOCK + "/:requestId",
            element: <AddRequestStock />,
        },
    ],
};

