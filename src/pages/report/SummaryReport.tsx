import React from "react";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import styled from "styled-components";
import { formatNumber } from "../../utils/helper";

// Interfaces
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
  totalSendBack: number;
}

interface SummaryReportProps {
  reportOrder?: ReportOrder;
  reportChange?: ReportChange;
}

interface StatCardProps {
  title: string;
  value: number;
  color: string;
  icon: React.ReactNode;
  suffix: string;
  highlight?: boolean;
}

// Styled Components
const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const Card = styled.div<{ color: string; highlight?: boolean }>`
  padding: 16px;
  border-radius: 12px;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 6px;
    height: 100%;
    background-color: ${props => props.color};
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  ${props => props.highlight && `
    background-color: rgba(240, 248, 255, 0.8);
    border: 1px solid ${props.color};
  `}
`;

const CardTitle = styled.div`
  font-size: 14px;
  color: #595959;
  margin-bottom: 8px;
`;

const ValueRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Value = styled.div<{ color: string }>`
  font-size: 24px;
  font-weight: 600;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Suffix = styled.span`
  font-size: 14px;
  font-weight: normal;
  margin-left: 4px;
`;

const Section = styled.div`
  margin-bottom: 16px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  margin-bottom: 12px;
  color: #262626;
  font-weight: 500;
`;

// StatCard Component
const StatCard: React.FC<StatCardProps> = ({ title, value, color, icon, suffix, highlight }) => (
  <Card color={color} highlight={highlight}>
    <CardTitle>{title}</CardTitle>
    <ValueRow>
      <Value color={color}>
        {icon}
        {formatNumber(value)}
        <Suffix>{suffix}</Suffix>
      </Value>
    </ValueRow>
  </Card>
);

// Main Component
const SummaryReport: React.FC<SummaryReportProps> = ({ reportOrder, reportChange }) => {

  // Calculate totals
  const totalSales = (reportOrder?.totalPrice || 0) + (reportChange?.amountAddOnNewOrder || 0);
  const totalCashReceived = ((reportOrder?.totalCashLak || 0) - (reportOrder?.totalSendBack || 0)) + 
                           ((reportChange?.totalCashLak || 0) - (reportChange?.totalSendBack || 0)) ;
  
  // Define stat groups for better organization
  const mainStats = [
    {
      title: "ອໍເດີ້ທັງໝົດ",
      value: reportOrder?.totalOrders || 0,
      color: "#1890ff",
      icon: <ArrowUpOutlined />,
      suffix: "ອໍເດີ",
      highlight: true
    },
    {
      title: "ຍອດຂາຍທັງໝົດ",
      value: totalSales,
      color: "#52c41a",
      icon: <ArrowUpOutlined />,
      suffix: "ກີບ",
      highlight: true
    },
    {
      title: "ຮັບເງິນສົດຕົວຈິງ",
      value: totalCashReceived,
      color: "#13c2c2",
      icon: <ArrowUpOutlined />,
      suffix: "ກີບ",
      highlight: true
    },
  ];
  
  const paymentMethodStats = [
    {
      title: "ເງິນສົດກີບ",
      value: (reportOrder?.totalCashLak || 0) + (reportChange?.totalCashLak || 0),
      color: "#722ed1",
      icon: <ArrowUpOutlined />,
      suffix: "ກີບ"
    },
    {
      title: "ເງິນໂອນກີບ",
      value: (reportOrder?.totalTransferLak || 0) + (reportChange?.totalTransferLak || 0),
      color: "#eb2f96",
      icon: <ArrowUpOutlined />,
      suffix: "ກີບ"
    },
    {
      title: "ເງິນສົດບາດ",
      value: reportOrder?.totalCashBath || 0,
      color: "#fa8c16",
      icon: <ArrowUpOutlined />,
      suffix: "bath"
    },
    {
      title: "ເງິນໂອນບາດ",
      value: reportOrder?.totalTransferBath || 0,
      color: "#fa541c",
      icon: <ArrowUpOutlined />,
      suffix: "bath"
    },
  ];
  
  const additionalStats = [
    {
      title: "ຄ່າຄອມມິດຊັ່ນພະນັກງານ",
      value: reportOrder?.totalCommission || 0,
      color: "#faad14",
      icon: <ArrowUpOutlined />,
      suffix: "ກີບ"
    },
    {
      title: "ລວມເງິນຮັບຈາກການປ່ຽນເຄື່ອງ",
      value: reportChange?.amountAddOnNewOrder || 0,
      color: "#a0d911",
      icon: <ArrowUpOutlined />,
      suffix: "ກີບ"
    },
    {
      title: "ລວມເງິນສ່ວນຫລຸດ",
      value: reportOrder?.totalDiscount || 0,
      color: "#f5222d",
      icon: <ArrowDownOutlined />,
      suffix: "ກີບ"
    },
    {
      title: "ເງິນທອນ",
      value: ((reportOrder?.totalSendBack || 0 )+ (reportChange?.totalSendBack || 0)),
      color: "#ff7a45",
      icon: <ArrowDownOutlined />,
      suffix: "ກີບ"
    },
  ];


  return (
    <div>
      <Section>
        <SectionTitle>ຂໍ້ມູນຫຼັກ</SectionTitle>
        <Container>
          {mainStats.map((stat, index) => (
            <StatCard
              key={`main-${index}`}
              title={stat.title}
              value={stat.value}
              color={stat.color}
              icon={stat.icon}
              suffix={stat.suffix}
              highlight={stat.highlight}
            />
          ))}
        </Container>
      </Section>
      
      <Section>
        <SectionTitle>ວິທີການຊໍາລະເງິນ</SectionTitle>
        <Container>
          {paymentMethodStats.map((stat, index) => (
            <StatCard
              key={`payment-${index}`}
              title={stat.title}
              value={stat.value}
              color={stat.color}
              icon={stat.icon}
              suffix={stat.suffix}
            />
          ))}
        </Container>
      </Section>
      
      <Section>
        <SectionTitle>ຂໍ້ມູນເພີ່ມເຕີມ</SectionTitle>
        <Container>
          {additionalStats.map((stat, index) => (
            <StatCard
              key={`additional-${index}`}
              title={stat.title}
              value={stat.value}
              color={stat.color}
              icon={stat.icon}
              suffix={stat.suffix}
            />
          ))}
        </Container>
      </Section>
    </div>
  );
};

export default SummaryReport;