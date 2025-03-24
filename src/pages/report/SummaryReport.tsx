import { Card, Col, Row, Statistic } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import { formatNumber } from "../../utils/helper";

interface ReportOrder {
  totalOrders: number;
  totalPrice: number;
  totalCashLak: number;
  totalTransferLak: number;
  totalCommission: number;
  totalTransferBath: number;
  totalCashBath: number;
  totalSendBack: number;
  totalDiscount: number;
}

interface ReportChange {
  amountAddOnNewOrder: number;
  totalCashLak: number;
  totalTransferLak: number;
  send_back_customer: number;
}

interface SummaryReportProps {
  reportOrder?: ReportOrder;
  reportChange?: ReportChange;
}

const SummaryReport: React.FC<SummaryReportProps> = ({ reportOrder, reportChange }) => {
  const stats = [
    {
      title: "ອໍເດີ້ທັງໝົດ",
      value: reportOrder?.totalOrders || 0,
      color: "#3f8600",
      prefix: <ArrowUpOutlined />,
      suffix: "ອໍເດີ",
    },
    {
      title: "ຍອດຂາຍທັງໝົດ",
      value: (reportOrder?.totalPrice || 0) + (reportChange?.amountAddOnNewOrder || 0),
      color: "#ff00d9",
      prefix: <ArrowUpOutlined />,
      suffix: "ກີບ",
    },
    {
      title: "ຮັບເງິນສົດຕົວຈິງ",
      value:
        ((reportOrder?.totalCashLak || 0) - (reportOrder?.totalSendBack || 0)) +
        ((reportChange?.totalCashLak || 0) - (reportChange?.send_back_customer || 0)),
      color: "#00cc14",
      prefix: <ArrowUpOutlined />,
      suffix: "ກີບ",
    },
    {
      title: "ຄ່າຄອມມິດຊັ່ນພະນັກງານ",
      value: reportOrder?.totalCommission || 0,
      color: "#00a7cc",
      prefix: <ArrowUpOutlined />,
      suffix: "ກີບ",
    },
    {
      title: "ເງິນສົດກີບ",
      value: (reportOrder?.totalCashLak || 0) + (reportChange?.totalCashLak || 0),
      color: "#ff00c8",
      prefix: <ArrowUpOutlined />,
      suffix: "ກີບ",
    },
    {
      title: "ເງິນໂອນກີບ",
      value: (reportOrder?.totalTransferLak || 0) + (reportChange?.totalTransferLak || 0),
      color: "#ff00c8",
      prefix: <ArrowUpOutlined />,
      suffix: "ກີບ",
    },
    {
      title: "ເງິນສົດບາດ",
      value: reportOrder?.totalCashBath || 0,
      color: "#f23800",
      prefix: <ArrowUpOutlined />,
      suffix: "bath",
    },
    {
      title: "ເງິນໂອນບາດ",
      value: reportOrder?.totalTransferBath || 0,
      color: "#f23800",
      prefix: <ArrowUpOutlined />,
      suffix: "bath",
    },
    {
      title: "ລວມເງິນຮັບຈາກການປ່ຽນເຄື່ອງ",
      value: reportChange?.amountAddOnNewOrder || 0,
      color: "#00cc14",
      prefix: <ArrowUpOutlined />,
      suffix: "ກີບ",
    },
    {
      title: "ລວມເງິນສ່ວນຫລຸດ",
      value: reportOrder?.totalDiscount || 0,
      color: "#f2ca00",
      prefix: <ArrowDownOutlined />,
      suffix: "ກີບ",
    },
    {
      title: "ເງິນທອນ",
      value: reportOrder?.totalSendBack || 0,
      color: "#f2001c",
      prefix: <ArrowDownOutlined />,
      suffix: "ກີບ",
    },
  ];

  return (
    <Row gutter={[16, 16]} style={{marginTop:10}}>
      {stats.map((stat, index) => (
        <Col key={index} xs={24} sm={12} md={8} lg={6}>
          <Card
            bordered={false}
            hoverable
            style={{
              borderRadius: 8,
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              backgroundColor: "#fff",
            }}
          >
            <Statistic
              title={stat.title}
              value={formatNumber(stat.value)}
              valueStyle={{ color: stat.color, fontSize: 20 }}
              prefix={stat.prefix}
              suffix={stat.suffix}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default SummaryReport;