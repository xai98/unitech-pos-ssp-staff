import styles from "../../styles/User.module.css";
import { useState } from "react";

import {
  addOneDate,
  currentDate,
  getUserDataFromLCStorage,
} from "../../utils/helper";
import { useQuery } from "@apollo/client";
import {
  GET_CHANGE_ORDERS,
  GET_ORDERS,
  GET_REPORT_ORDERS,
  REPORT_ORDER_CHANGE,
} from "../../services";
import { Spin, Tabs } from "antd";
import FilterReport from "./FilterReport";
import SummaryReport from "./SummaryReport";
import TableReport from "./TableReport";
import ReportChangeOrder from "./ReportChangeOrder";

interface FilterProps {
  from_date?: string;
  to_date?: string;
  limit: number;
  skip: number;
  order_no: string;
  limitChange: number;
  skipChange: number;
}

const ReportDashboard: React.FC = () => {
  const branchInfo = getUserDataFromLCStorage();
  const [filter, setFilter] = useState<FilterProps>({
    from_date: currentDate().startDate,
    to_date: currentDate().endDate,
    skip: 0,
    limit: 25,
    order_no: "",
    limitChange: 25,
    skipChange: 0,
  });

  const { loading, data: orderData } = useQuery(GET_ORDERS, {
    fetchPolicy: "cache-and-network",
    variables: {
      where: {
        branchId: branchInfo?.branchId?.id || undefined,
        order_no: filter?.order_no || undefined,
        from_date: filter?.from_date || undefined,
        to_date: addOneDate(filter?.to_date) || undefined,
      },
      orderBy: "createdAt_DESC",
      skip: filter?.skip,
      limit: filter?.limit,
    },
  });

  const { data: orderChangeData } = useQuery(GET_CHANGE_ORDERS, {
    fetchPolicy: "cache-and-network",
    variables: {
      where: {
        branchId: branchInfo?.branchId?.id || undefined,
        from_date: filter?.from_date || undefined,
        to_date: addOneDate(filter?.to_date) || undefined,
      },
      orderBy: "createdAt_DESC",
      skip: filter?.skipChange,
      limit: filter?.limitChange,
    },
  });

  // Get stocks with useFetchData hook
  const { data: reportData } = useQuery(GET_REPORT_ORDERS, {
    fetchPolicy: "network-only",
    variables: {
      where: {
        branchId: branchInfo?.branchId?.id || undefined,
        from_date: filter?.from_date || undefined,
        to_date: addOneDate(filter?.to_date) || undefined,
      },
    },
  });

  const { data: reportOrderChange } = useQuery(REPORT_ORDER_CHANGE, {
    fetchPolicy: "network-only",
    variables: {
      where: {
        branchId: branchInfo?.branchId?.id || undefined,
        from_date: filter?.from_date || undefined,
        to_date: addOneDate(filter?.to_date) || undefined,
      },
    },
  });

  const reportOrder = reportData?.reportOrders;
  const reportChange = reportOrderChange?.reportChangeOrder;

  const items = [
    {
      label: "ລາຍງານຍອດຂາຍ",
      icon: null,
      children: (
        <TableReport
          orderList={orderData?.orders?.data}
          orderTotal={orderData?.orders?.total}
          filter={filter}
          setFilter={setFilter}
        />
      ),
    },
    {
      label: "ລາຍງານລາຍການປ່ຽນສິນຄ້າ",
      icon: null,
      children: (
        <ReportChangeOrder
          orderList={orderChangeData?.changeOrders?.data}
          orderTotal={orderChangeData?.changeOrders?.total}
          filter={filter}
          setFilter={setFilter}
        />
      ),
    },
  ];

  return (
    <div style={{margin:'10px'}}>
      <Spin size="large" spinning={loading} tip="ກຳລັງໂຫລດຂໍ້ມູນ...">
        <div className={styles.headerTitle}>
          <h1>ສະຫຼຸບຍອດຂາຍ</h1>
        </div>
        <div style={{ height: 10 }}></div>

        {/* Filter */}
        <FilterReport filter={filter} setFilter={setFilter} />
        <div style={{ height: 10 }}></div>

        {/* Summary */}
        <SummaryReport reportOrder={reportOrder} reportChange={reportChange} />

        <Tabs
          // tabPosition={"left"}
          items={items.map((item, i) => {
            const id = String(i + 1);
            return {
              label: item?.label,
              key: id,
              children: item?.children,
            };
          })}
        />
      </Spin>
    </div>
  );
};

export default ReportDashboard;
