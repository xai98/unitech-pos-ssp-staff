import { Divider, Flex, InputNumber, Modal, Space, Button } from "antd";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_ORDER } from "../../services";
import { formatNumber, getUserDataFromLCStorage } from "../../utils/helper";
import { generateOrderNo } from "./component/generateOrderNo";
import ReactToPrint from "react-to-print";
import moment from "moment";
import { DollarOutlined, BankOutlined } from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";

interface PosPaymentProps {
  newOrderList: any[];
  setNewOrderList: (newOrderList: any[]) => void;
  isPayments: boolean;
  onClose: () => void;
  reloadStock: () => void;
  discountData: { type: string; value: number };
  totalFinal: { lak: number; bath: number; usd: number };
  exchange: { bath?: number; usd?: number; cny?: number };
  setDiscountData: (discountData: { type: string; value: number }) => void;
  lastOrder: any;
  reloadLastOrder: () => void;
  currentOrderId: string;
  setCurrentOrderId:(currentOrderId:string) => void;
  setOrders: (orders: { id: string; items: any[] }[]) => void;
  orders: { id: string; items: any[] }[];
  onOrderCompleted?: () => void;
}

const PosPayement: React.FC<PosPaymentProps> = ({
  newOrderList,
  setNewOrderList,
  isPayments,
  onClose,
  reloadStock,
  discountData,
  totalFinal,
  exchange,
  setDiscountData,
  lastOrder,
  reloadLastOrder,
  currentOrderId,
  setCurrentOrderId,
  setOrders,
  orders,
  onOrderCompleted
}) => {
  const branchInfo = getUserDataFromLCStorage();
  const printRef = useRef<HTMLDivElement>(null);
  const [paymentMethod, setPaymentMethod] = useState<
    "CASH" | "TRANSFER" | "CASH_AND_TRANSFER" | null
  >(null);
  const [payment, setPayment] = useState({
    cash_lak: 0,
    cash_bath: 0,
    cash_usd: 0,
    transfer_lak: 0,
    transfer_bath: 0,
    transfer_usd: 0,
  });
  const [isPaymentCompleted, setIsPaymentCompleted] = useState(false); // เพิ่มสถานะเพื่อตรวจสอบว่าชำระเงินสำเร็จหรือไม่
  const [printTrigger, setPrintTrigger] = useState(false); // ใช้ state เพื่อควบคุมการพิมพ์

  const [createOrder, { loading }] = useMutation(CREATE_ORDER, {
    onCompleted: () => {
      reloadStock();
      reloadLastOrder();
      setNewOrderList([]); // รีเซ็ตข้อมูลบิลปัจจุบัน
      setDiscountData({ type: "", value: 0 });
      setIsPaymentCompleted(true); // ตั้งค่าเป็น true เมื่อชำระสำเร็จ
      onClose(); // ปิด Modal
    setPrintTrigger(true); // เริ่มกระบวนการพิมพ์
    },
    onError: (error) => {
      console.error("Error creating order:", error);
    },
  });

  // ใช้ useEffect เพื่อจัดการการพิมพ์
  // useEffect(() => {
  //   if (shouldPrint && printRef.current) {
  //     (printRef.current.parentElement as any)?.querySelector("button")?.click();
  //     setShouldPrint(false); // รีเซ็ตหลังพิมพ์
  //   }
  // }, [shouldPrint]);

  const orderNo = lastOrder?.getLastOder?.order_no
    ? generateOrderNo(lastOrder.getLastOder)
    : "00000001";

  const totalPayment = Object.entries(payment).reduce((acc, [key, value]) => {
    if (key.includes("lak")) return acc + value;
    if (key.includes("bath")) return acc + value * (exchange.bath || 1);
    if (key.includes("usd")) return acc + value * (exchange.usd || 1);
    return acc;
  }, 0);

  const changeAmount = totalPayment - totalFinal.lak;

  // ฟังก์ชันคำนวณจำนวนเงิน Quick Pay ที่มากกว่า totalFinal.lak
  const generateQuickPayAmounts = (total: number) => {
    const baseAmounts = [];
    for (let i = 1; i <= 20; i++) {
      // สร้างจำนวนเงินสูงสุดถึง 1,000,000
      baseAmounts.push(i * 50000);
    }

    // กรองจำนวนที่มากกว่า total
    const greaterAmounts = baseAmounts.filter((amount) => amount > total);

    // ถ้าไม่มีจำนวนที่มากกว่า total (เช่น total สูงเกินไป) ให้ใช้ total + 50,000
    if (greaterAmounts.length === 0) {
      greaterAmounts.push(total + 50000);
    }

    // ใช้เฉพาะ 3 จำนวนแรกที่มากกว่า total
    return greaterAmounts.slice(0, 3);
  };

  const quickPayAmounts = generateQuickPayAmounts(totalFinal.lak);

  useEffect(() => {
    if (!isPayments) {
      setPaymentMethod(null);
      setPayment({
        cash_lak: 0,
        cash_bath: 0,
        cash_usd: 0,
        transfer_lak: 0,
        transfer_bath: 0,
        transfer_usd: 0,
      });
    } else if (paymentMethod === "TRANSFER") {
      // ตั้งค่าเริ่มต้นสำหรับเงินโอน (TRANSFER) ในสกุล LAK เท่ากับ totalFinal.lak
      setPayment((prev) => ({
        ...prev,
        transfer_lak: totalFinal.lak, // ใช้จำนวนเงินพอดี
        transfer_bath: 0, // ลบการตั้งค่าเริ่มต้น
        transfer_usd: 0, // ลบการตั้งค่าเริ่มต้น
      }));
    } else if (
      paymentMethod === "CASH" ||
      paymentMethod === "CASH_AND_TRANSFER"
    ) {
      // สำหรับ CASH และ CASH_AND_TRANSFER ไม่ตั้งค่าเริ่มต้นใดๆ (เริ่มที่ 0)
      setPayment((prev) => ({
        ...prev,
        cash_lak: 0,
        cash_bath: 0,
        cash_usd: 0,
        transfer_lak: 0,
        transfer_bath: 0,
        transfer_usd: 0,
      }));
    }
  }, [isPayments, paymentMethod, totalFinal.lak]);

  const quickPay = (amount: number) => {
    setPayment((prev) => ({ ...prev, cash_lak: amount }));
  };

  const handlePaymentChange =
    (field: keyof typeof payment) => (value: number | null) => {
      setPayment((prev) => ({ ...prev, [field]: value || 0 }));
    };

  const handleSaveAndPrint = async () => {
    if (loading || !paymentMethod || totalPayment < totalFinal.lak) return;

    const subtotal = newOrderList.reduce(
      (acc, item) => acc + item.order_total_price,
      0
    );
    const discountTotal =
      discountData.type === "PERCENT"
        ? subtotal * (discountData.value / 100)
        : discountData.value;

    const orderData = {
      order_no: orderNo,
      branchId: branchInfo?.branchId?.id,
      branchName: branchInfo?.branchId?.branchName,
      order_items: newOrderList,
      total_price: subtotal,
      totalCommission: newOrderList.reduce(
        (acc, item) => acc + (item.commission || 0),
        0
      ),
      discount_type: discountData.type || "NOT_DISCOUNT",
      discount: discountData.value,
      discount_total: discountTotal,
      exchangeRate: { bath: exchange.bath, usd: exchange.usd },
      typePay: paymentMethod,
      ...payment,
      totalOriginPrice: newOrderList.reduce(
        (acc, item) => acc + item.order_qty * item.price_cost,
        0
      ),
      final_receipt_total: totalFinal.lak,
      send_back_customer: changeAmount,
      overall_status: "PAYMENTED",
    };

    await createOrder({ variables: { data: orderData } });
    // ลบบิลปัจจุบันจาก orders เฉพาะเมื่อสร้างออเดอร์สำเร็จ
    setOrders(orders.filter((order) => order.id !== currentOrderId));
    setCurrentOrderId(orders[0].id)
    if (orders.length <= 1) {
      const newOrderId = uuidv4();
      setOrders([{ id: newOrderId, items: [] }]);
      setCurrentOrderId(newOrderId)
    }
    
    (printRef.current?.parentElement as any)?.querySelector("button")?.click();
  };

  // ปรับปรุง onClose เพื่อไม่ลบข้อมูลบิลเมื่อปิดโดยไม่ชำระเงิน
  const handleModalClose = () => {
    if (!isPaymentCompleted) {
      // หากยกเลิก (ไม่ชำระเงิน) ไม่ลบข้อมูลบิล
      onClose();
    } else {
      // หากชำระเงินสำเร็จ เรียก onClose ซึ่งจัดการลบข้อมูลบิลใน PosPage
      onClose();
    }
  };


  // เพิ่มฟังก์ชันตรวจสอบว่าจำนวนเงินรับเพียงพอกับยอดที่ต้องชำระหรือไม่
  const isPaymentMatched = (fieldValue: number, total: number) => {
    return fieldValue >= total && fieldValue > 0;
  };

  // ปรับแต่ง style ของ InputNumber
  const getInputStyle = (field: keyof typeof payment) => ({
    width: 200,
    borderColor: isPaymentMatched(payment[field], totalFinal.lak) ? '#52c41a' : undefined,
    backgroundColor: isPaymentMatched(payment[field], totalFinal.lak) ? '#f6ffed' : undefined,
  });

  // ฟังก์ชันที่จะเรียกเมื่อพิมพ์เสร็จหรือยกเลิก
  const handlePrintComplete = () => {
    onOrderCompleted?.(); // เรียกหลังจากพิมพ์เสร็จหรือยกเลิก
  };


  // Trigger การพิมพ์เมื่อ printTrigger เป็น true
  useEffect(() => {
    if (printTrigger && printRef.current) {
      // เรียกปุ่ม print โดยโปรแกรม
      (printRef.current.parentElement as any)?.querySelector("button")?.click();
    }
  }, [printTrigger]);

  return (
    <Modal
      open={isPayments}
      footer={null}
      onCancel={handleModalClose} // ใช้ handleModalClose แทน onCancel โดยตรง
      onClose={handleModalClose} // เพิ่ม onClose เพื่อให้แน่ใจว่าไม่ลบข้อมูลเมื่อปิด
      width={900}
      style={{ fontFamily: "Phetsarath OT, sans-serif" }}
    >
      <div style={{ padding: 16,  }}>
        {/* Header */}
        <div
          style={{
            background:
              totalPayment >= totalFinal.lak
                ? "linear-gradient(45deg, #52c41a, #95de64)"  // เปลี่ยนเป็นสีเขียวเมื่อรับเงินครบ
                : "linear-gradient(45deg, #d32f2f, #f44336)",
            color: "white",
            padding: 15,
            textAlign: "center",
            borderRadius: 8,
            marginBottom: 10,
          }}
        >
          <h2 style={{ margin: 0 }}>
            {totalPayment > totalFinal.lak
              ? `ເງິນທອນ: ${formatNumber(changeAmount)} ກີບ`
              : totalPayment === totalFinal.lak
              ? `ຮັບເງິນຄົບຖ້ວນ: ${formatNumber(totalFinal.lak)} ກີບ`  // ข้อความเมื่อรับเงินพอดี
              : `ເງິນບໍ່ພໍ: ${formatNumber(changeAmount)} ກີບ`}
          </h2>
        </div>

        {/* Payment Methods */}
        <Flex
          justify="space-around"
          style={{ padding: "10px 0", background: "#fff", borderRadius: 8 }}
        >
          {[
            { key: "CASH", label: "ສົດ", icon: <DollarOutlined /> },
            { key: "TRANSFER", label: "ໂອນ", icon: <BankOutlined /> },
            {
              key: "CASH_AND_TRANSFER",
              label: "ສົດ ແລະ ໂອນ",
              icon: <DollarOutlined />,
            },
          ].map((method) => (
            <Button
              key={method.key}
              onClick={() => setPaymentMethod(method.key as any)}
              type={paymentMethod === method.key ? "primary" : "default"}
              icon={method.icon}
              style={{ flex: 1, margin: "0 5px" }}
            >
              {method.label}
            </Button>
          ))}
        </Flex>

        {/* Payment Inputs */}
        {paymentMethod && (
          <Space
            direction="vertical"
            size="middle"
            style={{ width: "100%", padding: "10px 0" }}
          >
            {paymentMethod === "CASH" && (
              <>
                <Flex justify="space-between" align="center">
                  <span>ເງິນສົດ (ກີບ)</span>
                  <InputNumber
                    min={0}
                    value={payment.cash_lak}
                    onChange={handlePaymentChange("cash_lak")}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    style={getInputStyle("cash_lak")}
                  />
                </Flex>
                <Flex justify="space-between" align="center">
                  <span>ເງິນສົດ (ບາດ)</span>
                  <InputNumber
                    min={0}
                    value={payment.cash_bath}
                    onChange={handlePaymentChange("cash_bath")}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    style={getInputStyle("cash_bath")}
                  />
                </Flex>
                <Flex justify="space-between" align="center">
                  <span>ເງິນສົດ (USD)</span>
                  <InputNumber
                    min={0}
                    value={payment.cash_usd}
                    onChange={handlePaymentChange("cash_usd")}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    style={getInputStyle("cash_usd")}
                  />
                </Flex>
                <Flex gap={10}>
                  <Button
                    onClick={() => quickPay(totalFinal.lak)}
                    type="primary"
                    style={{ background: "#4CAF50", borderColor: "#4CAF50" }}
                  >
                    ພໍດີ
                  </Button>
                  {quickPayAmounts.map((amount) => (
                    <Button
                      key={amount}
                      onClick={() => quickPay(amount)}
                      style={{ background: "#f5f5f5", borderColor: "#d9d9d9" }}
                    >
                      {formatNumber(amount)}
                    </Button>
                  ))}
                </Flex>
                {/* ... Quick Pay Buttons เดิม ... */}
              </>
            )}
            {paymentMethod === "TRANSFER" && (
              <Flex justify="space-between" align="center">
                <span>ໂອນ (ກີບ)</span>
                <InputNumber
                  min={0}
                  value={payment.transfer_lak}
                  onChange={handlePaymentChange("transfer_lak")}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  style={getInputStyle("transfer_lak")}
                />
              </Flex>
            )}
            {paymentMethod === "CASH_AND_TRANSFER" && (
              <>
                <Flex justify="space-between" align="center">
                  <span>ເງິນສົດ (ກີບ)</span>
                  <InputNumber
                    min={0}
                    value={payment.cash_lak}
                    onChange={handlePaymentChange("cash_lak")}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    style={getInputStyle("cash_lak")}
                  />
                </Flex>
                <Flex justify="space-between" align="center">
                  <span>ໂອນ (ກີບ)</span>
                  <InputNumber
                    min={0}
                    value={payment.transfer_lak}
                    onChange={handlePaymentChange("transfer_lak")}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    style={getInputStyle("transfer_lak")}
                  />
                </Flex>
              </>
            )}
          </Space>
        )}

        {/* Actions */}
        <Divider />
        <Flex justify="space-between">
          <Button onClick={handleModalClose} size="large">
            ປິດ
          </Button>
          <Button
            type="primary"
            size="large"
            onClick={handleSaveAndPrint}
            disabled={
              loading || !paymentMethod || totalPayment < totalFinal.lak
            }
          >
            ຮັບເງິນ ແລະ ພິມບິນ
          </Button>
        </Flex>

        {/* Print Component */}
        <div style={{ display: "none" }}>
          <ReactToPrint
            trigger={() => <button />}
            content={() => printRef.current}
            onAfterPrint={handlePrintComplete} // เรียกเมื่อพิมพ์เสร็จ
            onPrintError={handlePrintComplete} // เรียกเมื่อยกเลิกหรือเกิดข้อผิดพลาด
          />
          <div ref={printRef}>
            <Bill
              newOrderList={newOrderList}
              orderNo={orderNo}
              exchange={exchange}
              totalFinal={totalFinal}
              discountData={discountData}
              branchInfo={branchInfo}
              changeAmount={changeAmount}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

interface BillProps {
  newOrderList: any[];
  orderNo: string;
  exchange: { bath?: number; usd?: number; cny?: number };
  totalFinal: { lak: number; bath: number; usd: number };
  discountData: { type: string; value: number };
  branchInfo: any;
  changeAmount: number;
}

const Bill: React.FC<BillProps> = ({
  newOrderList,
  orderNo,
  exchange,
  totalFinal,
  discountData,
  branchInfo,
  changeAmount,
}) => {
  const subtotal = newOrderList.reduce(
    (acc, item) => acc + item.order_total_price,
    0
  );
  const discountTotal =
    discountData.type === "PERCENT"
      ? subtotal * (discountData.value / 100)
      : discountData.value;

  return (
    <div style={{ fontFamily: "Phetsarath OT", padding: 10, fontSize: 12 }}>
      <div style={{ textAlign: "center", borderBottom: "1px dashed #000" }}>
        <h3 style={{ margin: 0 }}>ຮ້ານມິນິມາກ ສວນເສືອປ່າ</h3>
        <div>ສາຂາ {branchInfo?.branchId?.branchName}</div>
        <div>
          ພະນັກງານ: {branchInfo?.firstName} {branchInfo?.lastName}
        </div>
      </div>
      <div style={{ margin: "5px 0", borderBottom: "1px dashed #000" }}>
        <div>ເລກບິນ: {orderNo}</div>
        <div>ວັນທີ: {moment().format("DD-MM-YYYY HH:mm")}</div>
      </div>
      <div>
        {newOrderList.map((item, index) => (
          <div key={item.productId} style={{ margin: "5px 0" }}>
            <div>
              {index + 1}. {item.productName}
            </div>
            <div style={{ marginLeft: 10 }}>
              {formatNumber(item.order_qty)} x {formatNumber(item.price_sale)} ={" "}
              {formatNumber(item.order_total_price)} ກີບ
            </div>
          </div>
        ))}
      </div>
      <Divider dashed style={{margin:0}} />
      <Flex justify="space-between">
        <span>ລວມ</span>
        <span>{formatNumber(subtotal)} ກີບ</span>
      </Flex>
      {discountData.type && (
        <Flex justify="space-between">
          <span>
            ສ່ວນຫຼຸດ (
            {discountData.type === "PERCENT"
              ? `${discountData.value}%`
              : "ເງິນສົດ"}
            )
          </span>
          <span>{formatNumber(discountTotal)} ກີບ</span>
        </Flex>
      )}
      <Divider dashed style={{margin:0}} />

      <Flex justify="space-between" style={{ fontWeight: "bold" }}>
        <span>ຊຳລະຕົວຈິງ</span>
        <span>{formatNumber(totalFinal.lak)} ກີບ</span>
      </Flex>
      <Flex justify="space-between">
        <span>ເງິນທອນ</span>
        <span>{formatNumber(changeAmount)} ກີບ</span>
      </Flex>
      <div style={{ marginTop: 5 }}>
        <div>1 BATH = {formatNumber(exchange.bath || 0)}</div>
        <div>1 USD = {formatNumber(exchange.usd || 0)}</div>
      </div>
      <div style={{ textAlign: "center", marginTop: 10 }}>ຂອບໃຈ</div>
    </div>
  );
};

export default PosPayement;
