import { useState, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { Spin, Tabs, Card, Typography } from "antd";
import {
  GET_CHANGE_ORDERS,
  GET_ORDERS,
  GET_REPORT_ORDERS,
  REPORT_ORDER_CHANGE,
} from "../../services";
import {
  addOneDate,
  currentDate,
  getUserDataFromLCStorage,
} from "../../utils/helper";
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
  const branchInfo = useMemo(() => getUserDataFromLCStorage(), []);
  const [filter, setFilter] = useState<FilterProps>({
    from_date: currentDate().startDate,
    to_date: currentDate().endDate,
    skip: 0,
    limit: 25,
    order_no: "",
    limitChange: 25,
    skipChange: 0,
  });

  const commonVariables = useMemo(
    () => ({
      branchId: branchInfo?.branchId?.id,
      from_date: filter.from_date,
      to_date: addOneDate(filter.to_date),
    }),
    [branchInfo, filter.from_date, filter.to_date]
  );

  const { loading, data: orderData } = useQuery(GET_ORDERS, {
    fetchPolicy: "cache-and-network",
    variables: {
      where: {
        ...commonVariables,
        order_no: filter.order_no || undefined,
      },
      orderBy: "createdAt_DESC",
      skip: filter.skip,
      limit: filter.limit,
    },
    skip: !branchInfo?.branchId?.id,
  });

  const { data: orderChangeData } = useQuery(GET_CHANGE_ORDERS, {
    fetchPolicy: "cache-and-network",
    variables: {
      where: commonVariables,
      orderBy: "createdAt_DESC",
      skip: filter.skipChange,
      limit: filter.limitChange,
    },
    skip: !branchInfo?.branchId?.id,
  });

  const { data: reportData } = useQuery(GET_REPORT_ORDERS, {
    fetchPolicy: "network-only",
    variables: { where: commonVariables },
    skip: !branchInfo?.branchId?.id,
  });

  const { data: reportOrderChange } = useQuery(REPORT_ORDER_CHANGE, {
    fetchPolicy: "network-only",
    variables: { where: commonVariables },
    skip: !branchInfo?.branchId?.id,
  });

  const reportOrder = reportData?.reportOrders;
  const reportChange = reportOrderChange?.reportChangeOrder;

  const tabItems = useMemo(
    () => [
      {
        key: "1",
        label: "ລາຍງານຍອດຂາຍ",
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
        key: "2",
        label: "ລາຍງານລາຍການປ່ຽນສິນຄ້າ",
        children: (
          <ReportChangeOrder
            orderList={orderChangeData?.changeOrders?.data}
            orderTotal={orderChangeData?.changeOrders?.total}
            filter={filter}
            setFilter={setFilter}
          />
        ),
      },
    ],
    [orderData, orderChangeData, filter, setFilter]
  );

  return (
    <Card
      style={{
        margin: 16,
        borderRadius: 8,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      <Spin size="large" spinning={loading} tip="ກຳລັງໂຫລດຂໍ້ມູນ...">
        <Typography.Title level={3} style={{ margin: "0 0 16px 0" }}>
          ສະຫຼຸບຍອດຂາຍ
        </Typography.Title>

        <FilterReport filter={filter} setFilter={setFilter} />

        <SummaryReport reportOrder={reportOrder} reportChange={reportChange} />

        <Tabs
          defaultActiveKey="1"
          items={tabItems}
          style={{ marginTop: 16 }}
          tabBarStyle={{ marginBottom: 16 }}
        />
      </Spin>
    </Card>
  );
};

export default ReportDashboard;