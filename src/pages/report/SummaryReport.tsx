import { formatNumber } from "../../utils/helper";
import { Card, Col, Row, Statistic } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";

interface ReportProps {
  reportChange:any;
  reportOrder: {
    totalOrders: number;
    totalPrice: number;
    totalCashLak: number;
    totalTransferLak: number;
    totalCommission: number;
    totalTransferBath: number;
    totalCashBath: number;
    totalSendBack: number;
    totalDiscount: number;
  };
}

const SummaryReport: React.FC<ReportProps> = ({ reportOrder,reportChange }) => {

  

  // console.log("reportOrder?.totalCashLak--->", reportOrder?.totalCashLak)
  // console.log("reportOrder?.totalSendBack --->", reportOrder?.totalSendBack )
  // console.log("reportChange?.totalCashLak--->", reportChange?.totalCashLak)
  // console.log("reportChange?.send_back_customer--->", reportChange?.send_back_customer)


  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="ອໍເດີ້ທັງໝົດ"
              value={formatNumber(reportOrder?.totalOrders || 0)}
              valueStyle={{
                color: "#3f8600",
              }}
              prefix={<ArrowUpOutlined />}
              suffix="ອໍເດີ"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="ຍອດຂາຍທັງໝົດ"
              value={formatNumber(reportOrder?.totalPrice + reportChange?.amountAddOnNewOrder || 0)}
              valueStyle={{
                color: "#ff00d9",
              }}
              prefix={<ArrowUpOutlined />}
              suffix="ກີບ"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="ຮັບເງິນສົດຕົວຈິງ"
              value={formatNumber((reportOrder?.totalCashLak  - reportOrder?.totalSendBack ) || 0 + (reportChange?.totalCashLak - reportChange?.send_back_customer ) )}
              valueStyle={{
                color: "#00cc14",
              }}
              prefix={<ArrowUpOutlined />}
              suffix="ກີບ"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="ຄ່າຄອມມິດຊັ່ນພະນັກງານ"
              value={formatNumber(reportOrder?.totalCommission || 0)}
              valueStyle={{
                color: "#00a7cc",
              }}
              prefix={<ArrowUpOutlined />}
              suffix="ກີບ"
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="ເງິນສົດກີບ"
              value={formatNumber(reportOrder?.totalCashLak + reportChange?.totalCashLak || 0)}
              valueStyle={{
                color: "#ff00c8",
              }}
              prefix={<ArrowUpOutlined />}
              suffix="ກີບ"
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="ເງິນໂອນກີບ"
              value={formatNumber(reportOrder?.totalTransferLak + reportChange?.totalTransferLak || 0)}
              valueStyle={{
                color: "#ff00c8",
              }}
              prefix={<ArrowUpOutlined />}
              suffix="ກີບ"
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="ເງິນສົດບາດ"
              value={formatNumber(reportOrder?.totalCashBath || 0)}
              valueStyle={{
                color: "#f23800",
              }}
              prefix={<ArrowUpOutlined />}
              suffix="ກີບ"
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="ເງິນໂອນບາດ"
              value={formatNumber(reportOrder?.totalTransferBath || 0)}
              valueStyle={{
                color: "#f23800",
              }}
              prefix={<ArrowUpOutlined />}
              suffix="ກີບ"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic
              title="ລວມເງິນຮັບຈາກການປ່ຽນເຄື່ອງ"
              value={formatNumber(reportChange?.amountAddOnNewOrder || 0)}
              valueStyle={{
                color: "#00cc14",
              }}
              prefix={<ArrowUpOutlined />}
              suffix="ກີບ"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic
              title="ລວມເງິນສ່ວນຫລຸດ"
              value={formatNumber(reportOrder?.totalDiscount || 0)}
              valueStyle={{
                color: "#f2ca00",
              }}
              prefix={<ArrowDownOutlined />}
              suffix="ກີບ"
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card bordered={false}>
            <Statistic
              title="ເງິນທອນ"
              value={formatNumber(reportOrder?.totalSendBack || 0)}
              valueStyle={{
                color: "#f2001c",
              }}
              prefix={<ArrowDownOutlined />}
              suffix="ກີບ"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SummaryReport;
