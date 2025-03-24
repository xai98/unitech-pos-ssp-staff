import React, { useEffect, useRef, useState } from "react";
import { Button, Col, Divider, InputNumber, message, Modal, Row, Space } from "antd";
import { useMutation } from "@apollo/client";
import ReactToPrint from "react-to-print";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { CREATE_CHANGE_ORDER } from "../../services";
import { formatNumber, getUserDataFromLCStorage } from "../../utils/helper";
import useEnterKeyHandler from "./component/useEnterKeyHandler";
import routes from "../../utils/routes";

interface PosPayment {
  orderId?: string;
  order_no?: string;
  newOrderList: any[];
  changeOrderList: any[];
  beforeOrderList: any[];
  isPayments: boolean;
  onClose: () => void;
  exchange: { bath?: number; usd?: number; cny?: number };
}

interface TotalPay {
  cash_lak: number;
  cash_bath: number;
  cash_usd: number;
  transfer_lak: number;
  transfer_bath: number;
  transfer_usd: number;
  amount: number;
}

const paymentOptions = [
  { value: "CASH", label: "ເງິນສົດ" },
  { value: "TRANSFER", label: "ເງິນໂອນ" },
  { value: "CASH_AND_TRANSFER", label: "ເງິນສົດ ແລະ ໂອນ" },
] as const;

const quickCashOptions = [50000, 100000, 150000, 200000, 250000, 300000];

const PosPayementChange: React.FC<PosPayment> = ({
  orderId,
  order_no,
  newOrderList,
  changeOrderList,
  beforeOrderList,
  isPayments,
  onClose,
  exchange,
}) => {
  const navigate = useNavigate();
  const branchInfo = getUserDataFromLCStorage();
  const printComponentRef = useRef<HTMLDivElement>(null);
  const reactToPrintContent = useRef<any>(null);

  const [typePay, setTypePay] = useState<string | null>(null);
  const [totalPay, setTotalPay] = useState<TotalPay>({
    cash_lak: 0,
    cash_bath: 0,
    cash_usd: 0,
    transfer_lak: 0,
    transfer_bath: 0,
    transfer_usd: 0,
    amount: 0,
  });
  const [isExactAmount, setIsExactAmount] = useState(false);

  const [createOrderChange, { loading }] = useMutation(CREATE_CHANGE_ORDER);

  // Calculate totals
  const sumNewOrder = newOrderList.reduce((acc, item) => acc + (item.order_total_price || 0), 0);
  const sumChangeOrder = changeOrderList.reduce((acc, item) => acc + (item.order_total_price || 0), 0);
  const sumTotalChange = sumNewOrder - sumChangeOrder;
  const totalPriceCost = newOrderList.reduce((acc, item) => acc + item.order_qty * item.price_cost, 0);

  // Calculate total amount in LAK
  useEffect(() => {
    const rates = { cash_lak: 1, cash_bath: exchange.bath || 1, cash_usd: exchange.usd || 1, transfer_lak: 1, transfer_bath: exchange.bath || 1, transfer_usd: exchange.usd || 1 };
    const newAmount = Object.entries(rates).reduce((acc, [key, rate]) => acc + (totalPay[key as keyof TotalPay] || 0) * rate, 0);
    setTotalPay((prev) => ({ ...prev, amount: newAmount }));
  }, [totalPay, exchange]);

  // Reset payment fields when payment type changes
  useEffect(() => {
    setTotalPay({
      cash_lak: typePay === "CASH" && isExactAmount ? sumTotalChange : 0,
      cash_bath: 0,
      cash_usd: 0,
      transfer_lak: typePay === "TRANSFER" && isExactAmount ? sumTotalChange : 0,
      transfer_bath: 0,
      transfer_usd: 0,
      amount: 0,
    });
  }, [typePay, isExactAmount, sumTotalChange]);

  const changeAmount = totalPay.amount - sumTotalChange;
  const isInsufficient = changeAmount < 0;

  const handleQuickCash = (value: number) => {
    if (!typePay) {
      message.warning("ກະລຸນາເລືອກປະເພດການຊຳລະກ່ອນ");
      return;
    }
    const field = typePay === "TRANSFER" ? "transfer_lak" : "cash_lak";
    setTotalPay((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAndPrint = async () => {
    if (loading) return;
    if (!typePay) {
      message.warning("ກະລຸນາເລືອກປະເພດການຊຳລະກ່ອນບັນທຶກ");
      return;
    }
    if (totalPay.amount < sumTotalChange) {
      message.error("ຈຳນວນເງິນບໍ່ພຽງພໍ");
      return;
    }

    const orderData = {
      orderId,
      order_no,
      branchId: branchInfo?.branchId?.id,
      branchName: branchInfo?.branchId?.branchName,
      oldItem: beforeOrderList,
      newChangeItem: newOrderList,
      changeItem: changeOrderList,
      totalOriginPriceNewItem: totalPriceCost,
      totalOldOrder: beforeOrderList.reduce((acc, item) => acc + (item.order_total_price || 0), 0),
      totalNewOrder: sumNewOrder,
      toalChangeOrder: sumChangeOrder,
      amountAddOnNewOrder: sumTotalChange,
      send_back_customer: changeAmount,
      cash_lak: totalPay.cash_lak,
      transfer_lak: totalPay.transfer_lak,
      typePay,
    };

    try {
      const result = await createOrderChange({ variables: { data: orderData } });
      if (result?.data?.createChangeOrder?.id) {
        message.success("ປ່ຽນເຄື່ອງສຳເລັດ");
        reactToPrintContent.current?.handlePrint();
        onClose();
        navigate(routes.REPORT_DASHBOARD);
      }
    } catch (error) {
      message.error("ກະລຸນາລອງໃໝ່");
      console.error("Error:", error);
    }
  };

  useEnterKeyHandler(handleSaveAndPrint, isPayments);

  const renderInput = (label: string, field: keyof TotalPay, disabled: boolean) => (
    <Row gutter={8} style={{ marginBottom: 10 }}>
      <Col span={6} style={{ textAlign: "right", fontSize: 18 }}>{label}</Col>
      <Col span={18}>
        <InputNumber
          size="large"
          min={0}
          value={totalPay[field]}
          onChange={(value) => setTotalPay((prev) => ({ ...prev, [field]: value || 0 }))}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          parser={(value) => parseFloat(value?.replace(/,/g, "") || "0")}
          style={{ width: "100%" }}
          disabled={disabled}
        />
      </Col>
    </Row>
  );

  return (
    <Modal open={isPayments} footer={null} width={900} closable={false}>
      <div style={{ padding: 16 }}>
        {/* Header */}
        <div
          style={{
            backgroundColor: isInsufficient ? "red" : changeAmount > 0 ? "green" : "#1890ff",
            color: "white",
            padding: 12,
            textAlign: "center",
            fontSize: 24,
            fontWeight: "bold",
            borderRadius: 4,
          }}
        >
          {changeAmount > 0
            ? `ເງິນທອນ: ${formatNumber(changeAmount)} ກີບ`
            : isInsufficient
            ? `ເງິນບໍ່ພໍ: ${formatNumber(changeAmount)} ກີບ`
            : `ຕ້ອງຮັບ: ${formatNumber(sumTotalChange)} ກີບ`}
        </div>

        {/* Payment Type Selection */}
        <Row gutter={[8, 8]} style={{ margin: "16px 0" }}>
          {paymentOptions.map((option) => (
            <Col span={8} key={option.value}>
              <Button
                type={typePay === option.value ? "primary" : "default"}
                onClick={() => setTypePay(option.value)}
                block
                size="large"
              >
                {option.label}
              </Button>
            </Col>
          ))}
        </Row>

        {/* Payment Inputs */}
        {typePay && (
          <div style={{ background: "#fff", padding: 16, borderRadius: 4 }}>
            {(typePay === "CASH" || typePay === "CASH_AND_TRANSFER") && (
              <>
                {renderInput("ສົດກີບ", "cash_lak", false)}
                {renderInput("ສົດບາດ", "cash_bath", false)}
                {renderInput("ສົດໂດລາ", "cash_usd", false)}
              </>
            )}
            {(typePay === "TRANSFER" || typePay === "CASH_AND_TRANSFER") && (
              <>
                {renderInput("ໂອນກີບ", "transfer_lak", false)}
                {renderInput("ໂອນບາດ", "transfer_bath", false)}
                {renderInput("ໂອນໂດລາ", "transfer_usd", false)}
              </>
            )}
            <Divider style={{margin:0}} />
            <Space wrap>
              {quickCashOptions.map((value) => (
                <Button key={value} onClick={() => handleQuickCash(value)}>
                  {formatNumber(value)} ກີບ
                </Button>
              ))}
            </Space>
          </div>
        )}

        {/* Footer Actions */}
        <Row gutter={8} style={{ marginTop: 16 }}>
          <Col span={6}>
            <Button
              block
              size="large"
              onClick={() => setIsExactAmount(!isExactAmount)}
              style={{ background: isExactAmount ? "green" : undefined, color: isExactAmount ? "white" : undefined }}
            >
              ຈຳນວນພໍດີ
            </Button>
          </Col>
          <Col span={14}>
            <Button
              type="primary"
              block
              size="large"
              onClick={handleSaveAndPrint}
              loading={loading}
            >
              ຮັບເງິນ ແລະ ພິມ
            </Button>
          </Col>
          <Col span={4}>
            <Button block size="large" onClick={onClose}>
              ປິດ
            </Button>
          </Col>
        </Row>

        {/* Print Component */}
        <div style={{ display: "none" }}>
          <ReactToPrint
            content={() => printComponentRef.current}
            ref={reactToPrintContent}
          />
          <div ref={printComponentRef}>
            <Bill
              newOrderList={newOrderList}
              totalPay={totalPay}
              order_no={order_no}
              sumTotalPrice={sumNewOrder}
              branchInfo={branchInfo}
              changeAmount={changeAmount}
              sumTotalChange={sumTotalChange}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

interface BillProps {
  newOrderList: any[];
  totalPay: TotalPay;
  order_no?: string;
  sumTotalPrice: number;
  branchInfo: any;
  changeAmount: number;
  sumTotalChange: number;
}

const Bill: React.FC<BillProps> = ({
  newOrderList,
  order_no,
  sumTotalPrice,
  branchInfo,
  changeAmount,
  sumTotalChange,
}) => (
  <div style={{ fontFamily: "Phetsarath OT", padding: 10, fontSize: 14 }}>
    <div style={{ textAlign: "center", borderBottom: "1px dashed gray" }}>
      <strong>ຮ້ານມິນິມາກ ສວນເສືອປ່າ</strong>
      <div>ສາຂາ {branchInfo?.branchId?.branchName}</div>
      <div>ພະນັກງານ: {branchInfo?.firstName} {branchInfo?.lastName}</div>
    </div>
    <div style={{ margin: "8px 0" }}>
      <div>ເລກບິນ: {order_no}</div>
      <div>ວັນທີ: {moment().format("DD-MM-YYYY HH:mm")}</div>
    </div>
    <Divider dashed style={{margin:0}} />
    {newOrderList.map((item, index) => (
      <div key={item?.id}>
        <div>{index + 1}. {item?.productName || "-"}</div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ paddingLeft: 10 }}>
            ({formatNumber(item?.order_qty || 0)} x {formatNumber(item?.price_sale || 0)})
          </span>
          <span>{formatNumber(item?.order_total_price || 0)}</span>
        </div>
      </div>
    ))}
    <Divider dashed style={{margin:0}} />
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span>ລວມ:</span>
      <strong>{formatNumber(sumTotalPrice)} ກີບ</strong>
    </div>
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span>ຊຳລະຕົວຈິງ:</span>
      <strong>{formatNumber(sumTotalChange)} ກີບ</strong>
    </div>
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span>ເງິນທອນ:</span>
      <strong>{formatNumber(changeAmount)} ກີບ</strong>
    </div>
    <div style={{ textAlign: "center", marginTop: 10 }}>ຂໍຂອບໃຈ</div>
  </div>
);

export default PosPayementChange;