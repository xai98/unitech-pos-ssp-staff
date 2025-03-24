import { Button, Card, Col, Divider, Drawer, Flex, Row, Space, Typography } from "antd";
import { useRef, useCallback } from "react";
import ReactToPrint from "react-to-print";
import { BillComponent } from "../../components/BillComponent";
import {
  converTypePay,
  formatDate,
  formatNumber,
  getUserDataFromLCStorage,
} from "../../utils/helper";

interface OrderItem {
  productId: string;
  productName: string;
  price_sale: number;
  order_qty: number;
  order_total_price: number;
}

interface OrderDetail {
  branchId: { branchName: string };
  createdBy: string;
  order_no: string;
  createdAt: Date;
  typePay: string;
  oldItem: OrderItem[];
  changeItem: OrderItem[];
  newChangeItem: OrderItem[];
  totalOldOrder: number;
  toalChangeOrder: number;
  totalNewOrder: number;
  amountAddOnNewOrder: number;
  cash_lak: number;
  transfer_lak: number;
  send_back_customer: number;
}

interface Props {
  viewDetail: { show: boolean; data: OrderDetail | null };
  onClose: () => void;
}

const ViewDetailOrderChange: React.FC<Props> = ({ viewDetail, onClose }) => {
  const branchInfo = getUserDataFromLCStorage();
  const detail = viewDetail.data;

  const printComponentRef = useRef<HTMLDivElement>(null);
  const reactToPrintContent = useRef<any>(null);

  const handlePrintBill = useCallback(() => {
    reactToPrintContent.current?.handlePrint();
  }, []);

  if (!detail) return null;

  return (
    <Drawer
      width={900}
      placement="right"
      title={<Typography.Title level={4}>ລາຍລະອຽດການປ່ຽນສິນຄ້າ</Typography.Title>}
      closable
      onClose={onClose}
      open={viewDetail.show}
      extra={
        <Space>
          <Button type="primary" onClick={handlePrintBill}>
            ພິມບິນ
          </Button>

        </Space>
      }
      styles={{ body: { padding: 16 } }}
    >
      <Card size="small" style={{ marginBottom: 16, borderRadius: 8 }}>
        <Row gutter={[16, 8]}>
          <Col span={12}>
            <DescriptionItem title="ສາຂາ" content={detail.branchId?.branchName} />
          </Col>
          <Col span={12}>
            <DescriptionItem title="ພະນັກງານຂາຍ" content={detail.createdBy} />
          </Col>
          <Col span={8}>
            <DescriptionItem title="ເລກທີບິນ" content={detail.order_no} />
          </Col>
          <Col span={8}>
            <DescriptionItem title="ວັນທີປ່ຽນ" content={formatDate(detail.createdAt)} />
          </Col>
          <Col span={8}>
            <DescriptionItem title="ປະເພດຊຳລະ" content={converTypePay(detail.typePay)} />
          </Col>
        </Row>
      </Card>

      <Row gutter={16}>
        <Col span={8}>
          <OrderListCard
            title="ລາຍການສັ່ງຊື້ກ່ອນປ່ຽນ"
            items={detail.oldItem}
            total={detail.totalOldOrder}
          />
        </Col>
        <Col span={8}>
          <OrderListCard
            title="ລາຍການຖືກປ່ຽນ"
            items={detail.changeItem}
            total={detail.toalChangeOrder}
          />
        </Col>
        <Col span={8}>
          <OrderListCard
            title="ລາຍການປ່ຽນໃໝ່"
            items={detail.newChangeItem}
            total={detail.totalNewOrder}
          />
        </Col>
      </Row>

      <Divider style={{ margin: "16px 0" }} />

      <Flex justify="space-between" style={{ marginBottom: 8 }}>
        <Typography.Text strong>ລວມເງິນຮັບເພີ່ມ</Typography.Text>
        <Typography.Text strong>{formatNumber(detail.amountAddOnNewOrder || 0)} ກີບ</Typography.Text>
      </Flex>
      <Divider style={{ margin: "8px 0" }} />
      <Flex justify="space-between">
        <Typography.Text strong style={{ fontSize: 16 }}>
          ຊຳລະຕົວຈິງ
        </Typography.Text>
        <Typography.Text strong style={{ fontSize: 16, color: "#1890ff" }}>
          {formatNumber(detail.amountAddOnNewOrder || 0)} ກີບ
        </Typography.Text>
      </Flex>

      <PaymentSection
        cashLak={detail.cash_lak}
        transferLak={detail.transfer_lak}
        sendBackCustomer={detail.send_back_customer}
      />

      <div style={{ display: "none" }}>
        <ReactToPrint
          trigger={() => <></>}
          content={() => printComponentRef.current}
          ref={reactToPrintContent}
        />
        <div ref={printComponentRef}>
          <BillComponent detail={detail} branchInfo={branchInfo} />
        </div>
      </div>
    </Drawer>
  );
};

interface DescriptionItemProps {
  title: string;
  content: string | number;
}

const DescriptionItem: React.FC<DescriptionItemProps> = ({ title, content }) => (
  <Flex vertical>
    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
      {title}
    </Typography.Text>
    <Typography.Text>{content || "-"}</Typography.Text>
  </Flex>
);

interface OrderListCardProps {
  title: string;
  items: OrderItem[];
  total: number;
}

const OrderListCard: React.FC<OrderListCardProps> = ({ title, items, total }) => (
  <Card
    size="small"
    title={<Typography.Text strong>{title}</Typography.Text>}
    style={{ borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
    bodyStyle={{ padding: 12 }}
  >
    {items?.map((item, index) => (
      <Flex
        key={item.productId}
        justify="space-between"
        align="center"
        style={{
          padding: "8px 0",
          borderBottom: index < items.length - 1 ? "1px solid #f0f0f0" : "none",
        }}
      >
        <Flex vertical gap={4}>
          <Typography.Text style={{ fontSize: 14 }}>
            {index + 1}. {item.productName}
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12, paddingLeft: 13 }}>
            {formatNumber(item.price_sale || 0)} × {formatNumber(item.order_qty || 0)}
          </Typography.Text>
        </Flex>
        <Typography.Text style={{ fontSize: 14, color: "gray" }}>
          {formatNumber(item.order_total_price || 0)} ກີບ
        </Typography.Text>
      </Flex>
    ))}
    <Divider style={{ margin: "8px 0" }} />
    <Flex justify="space-between">
      <Typography.Text strong>ລວມເງິນ</Typography.Text>
      <Typography.Text strong>{formatNumber(total || 0)} ກີບ</Typography.Text>
    </Flex>
  </Card>
);

interface PaymentSectionProps {
  cashLak: number;
  transferLak: number;
  sendBackCustomer: number;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  cashLak,
  transferLak,
  sendBackCustomer,
}) => (
  <>
    <Typography.Text strong style={{ marginTop: 16, display: "block" }}>
      ຂໍ້ມູນການຊຳລະເງິນສົດ
    </Typography.Text>
    <Divider style={{ margin: "8px 0" }} />
    <Flex justify="space-between" style={{ marginBottom: 8 }}>
      <Typography.Text strong>ສົດກີບ</Typography.Text>
      <Typography.Text>{formatNumber(cashLak || 0)} ກີບ</Typography.Text>
    </Flex>

    <Typography.Text strong style={{ marginTop: 16, display: "block" }}>
      ຂໍ້ມູນການຊຳລະເງິນໂອນ
    </Typography.Text>
    <Divider style={{ margin: "8px 0" }} />
    <Flex justify="space-between" style={{ marginBottom: 8 }}>
      <Typography.Text strong>ໂອນກີບ</Typography.Text>
      <Typography.Text>{formatNumber(transferLak || 0)} ກີບ</Typography.Text>
    </Flex>

    <Typography.Text strong style={{ marginTop: 16, display: "block" }}>
      ຂໍ້ມູນການທອນເງິນ
    </Typography.Text>
    <Divider style={{ margin: "8px 0" }} />
    <Flex justify="space-between" style={{ marginBottom: 8 }}>
      <Typography.Text strong>ເງິນທອນ</Typography.Text>
      <Typography.Text>{formatNumber(sendBackCustomer || 0)} ກີບ</Typography.Text>
    </Flex>
  </>
);

export default ViewDetailOrderChange;