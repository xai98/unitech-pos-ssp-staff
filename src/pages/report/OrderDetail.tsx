import { Button, Divider, Drawer, Flex, Space, Typography, Card, Row, Col } from "antd";
import { useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ReactToPrint from "react-to-print";
import { BillComponent } from "../../components/BillComponent";
import {
  converTypePay,
  formatDate,
  formatNumber,
  getUserDataFromLCStorage,
} from "../../utils/helper";
import routes from "../../utils/routes";

interface OrderDetail {
  id: string;
  branchId: { branchName: string };
  createdBy: string;
  order_no: string;
  createdAt: Date;
  typePay: string;
  order_items: Array<{
    productId: string;
    productName: string;
    price_sale: number;
    order_qty: number;
    order_total_price: number;
  }>;
  total_price: number;
  typeDiscount: string;
  discount: number;
  final_receipt_total: number;
  cash_lak: number;
  cash_bath: number;
  cash_usd: number;
  transfer_lak: number;
  transfer_bath: number;
  transfer_usd: number;
  exchangeRate: { bath: number; usd: number };
}

interface ViewDetailProps {
  viewDetail: { show: boolean; data: OrderDetail | null };
  onClose: () => void;
}

const ViewDetailOrder: React.FC<ViewDetailProps> = ({ viewDetail, onClose }) => {
  const navigate = useNavigate();
  const branchInfo = getUserDataFromLCStorage();
  const detail = viewDetail.data;

  const printComponentRef = useRef<HTMLDivElement>(null);
  const reactToPrintContent = useRef<any>(null);

  const handlePrintBill = useCallback(() => {
    reactToPrintContent.current?.handlePrint();
  }, []);

  const handleChangeProduct = useCallback(() => {
    if (detail?.id) {
      navigate(`${routes.CHANGE_PRODUCT}/${detail.id}`);
    }
  }, [detail?.id, navigate]);

  if (!detail) return null;

  return (
    <Drawer
      width={640}
      placement="right"
      title={<Typography.Title level={4}>ລາຍລະອຽດການສັ່ງຊື້</Typography.Title>}
      closable
      onClose={onClose}
      open={viewDetail.show}
      extra={
        <Space>
          <Button type="primary" onClick={handlePrintBill}>
            ພິມບິນ
          </Button>
          <Button type="primary" onClick={handleChangeProduct}>
            ປ່ຽນເຄື່ອງ
          </Button>
        </Space>
      }
      styles={{
        body: { padding: "16px" },
      }}
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
            <DescriptionItem title="ວັນທີຂາຍ" content={formatDate(detail?.createdAt)} />
          </Col>
          <Col span={8}>
            <DescriptionItem title="ປະເພດຊຳລະ" content={converTypePay(detail.typePay)} />
          </Col>
        </Row>
      </Card>

      <Typography.Text strong>ລາຍການສັ່ງຊື້</Typography.Text>
      <Divider style={{ margin: "8px 0" }} />

      {detail.order_items?.map((item, index) => (
        <Card
          key={item.productId}
          size="small"
          style={{
            marginBottom: 8,
            borderRadius: 8,
            backgroundColor: index === 0 ? "#f9faff" : "#fff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <Flex justify="space-between" align="center">
            <Typography.Text style={{ fontSize: 14 }}>
              {index + 1}. {item.productName}
            </Typography.Text>
            <Flex gap={8} align="center">
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {formatNumber(item.price_sale || 0)} × {formatNumber(item.order_qty || 0)}
              </Typography.Text>
              <Typography.Text strong style={{ fontSize: 14 }}>
                {formatNumber(item.order_total_price || 0)} ກີບ
              </Typography.Text>
            </Flex>
          </Flex>
        </Card>
      ))}

      <Divider style={{ margin: "16px 0" }} />

      <SummarySection
        totalPrice={detail.total_price}
        typeDiscount={detail.typeDiscount}
        discount={detail.discount}
        finalReceiptTotal={detail.final_receipt_total}
      />

      <PaymentSection
        cashLak={detail.cash_lak}
        cashBath={detail.cash_bath}
        cashUsd={detail.cash_usd}
        transferLak={detail.transfer_lak}
        transferBath={detail.transfer_bath}
        transferUsd={detail.transfer_usd}
      />

      <ExchangeRateSection exchangeRate={detail.exchangeRate} />

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

interface SummarySectionProps {
  totalPrice: number;
  typeDiscount: string;
  discount: number;
  finalReceiptTotal: number;
}

const SummarySection: React.FC<SummarySectionProps> = ({
  totalPrice,
  typeDiscount,
  discount,
  finalReceiptTotal,
}) => (
  <>
    <Flex justify="space-between" style={{ marginBottom: 8 }}>
      <Typography.Text strong>ລວມ</Typography.Text>
      <Typography.Text strong>{formatNumber(totalPrice || 0)} ກີບ</Typography.Text>
    </Flex>
    <Flex justify="space-between" style={{ marginBottom: 8 }}>
      <Typography.Text strong>
        ສ່ວນຫຼຸດ (
        {typeDiscount === "AMOUNT"
          ? "ເປັນຈຳນວນເງິນ"
          : typeDiscount === "PERCENT"
          ? `${discount}%`
          : typeDiscount || "ບໍ່ມີ"}
        )
      </Typography.Text>
      <Typography.Text strong>
        {formatNumber(
          typeDiscount === "PERCENT" ? totalPrice * (discount / 100) : discount || 0
        )}{" "}
        ກີບ
      </Typography.Text>
    </Flex>
    <Divider style={{ margin: "8px 0" }} />
    <Flex justify="space-between">
      <Typography.Text strong style={{ fontSize: 16 }}>
        ຊຳລະຕົວຈິງ
      </Typography.Text>
      <Typography.Text strong style={{ fontSize: 16, color: "#1890ff" }}>
        {formatNumber(finalReceiptTotal || 0)} ກີບ
      </Typography.Text>
    </Flex>
  </>
);

interface PaymentSectionProps {
  cashLak: number;
  cashBath: number;
  cashUsd: number;
  transferLak: number;
  transferBath: number;
  transferUsd: number;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  cashLak,
  cashBath,
  cashUsd,
  transferLak,
  transferBath,
  transferUsd,
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
    <Flex justify="space-between" style={{ marginBottom: 8 }}>
      <Typography.Text strong>ສົດບາດ</Typography.Text>
      <Typography.Text>{formatNumber(cashBath || 0)} bath</Typography.Text>
    </Flex>
    <Flex justify="space-between" style={{ marginBottom: 8 }}>
      <Typography.Text strong>ສົດໂລດາ</Typography.Text>
      <Typography.Text>{formatNumber(cashUsd || 0)} usd</Typography.Text>
    </Flex>

    <Typography.Text strong style={{ marginTop: 16, display: "block" }}>
      ຂໍ້ມູນການຊຳລະເງິນໂອນ
    </Typography.Text>
    <Divider style={{ margin: "8px 0" }} />
    <Flex justify="space-between" style={{ marginBottom: 8 }}>
      <Typography.Text strong>ໂອນກີບ</Typography.Text>
      <Typography.Text>{formatNumber(transferLak || 0)} ກີບ</Typography.Text>
    </Flex>
    <Flex justify="space-between" style={{ marginBottom: 8 }}>
      <Typography.Text strong>ໂອນບາດ</Typography.Text>
      <Typography.Text>{formatNumber(transferBath || 0)} bath</Typography.Text>
    </Flex>
    <Flex justify="space-between" style={{ marginBottom: 8 }}>
      <Typography.Text strong>ໂອນໂລດາ</Typography.Text>
      <Typography.Text>{formatNumber(transferUsd || 0)} usd</Typography.Text>
    </Flex>
  </>
);

interface ExchangeRateSectionProps {
  exchangeRate: { bath: number; usd: number };
}

const ExchangeRateSection: React.FC<ExchangeRateSectionProps> = ({ exchangeRate }) => (
  <>
    <Typography.Text strong style={{ marginTop: 16, display: "block" }}>
      ອັດຕາແລກປ່ຽນ
    </Typography.Text>
    <Divider style={{ margin: "8px 0" }} />
    <Row gutter={[16, 8]}>
      <Col span={12}>
        <DescriptionItem title="1 ບາດ" content={formatNumber(exchangeRate?.bath || 0)} />
      </Col>
      <Col span={12}>
        <DescriptionItem title="1 ໂດລາ" content={formatNumber(exchangeRate?.usd || 0)} />
      </Col>
    </Row>
  </>
);

export default ViewDetailOrder;