import { Divider, Flex, InputNumber, Modal, Space, Button, Card, Typography, Badge, Tabs } from "antd";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_ORDER } from "../../services";
import { formatNumber, getUserDataFromLCStorage } from "../../utils/helper";
import { generateOrderNo } from "./component/generateOrderNo";
import ReactToPrint from "react-to-print";
import moment from "moment";
import { 
  DollarOutlined, 
  BankOutlined, 
  CheckCircleOutlined, 
  PrinterOutlined, 
  CloseCircleOutlined,
} from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

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

const PosPayment: React.FC<PosPaymentProps> = ({
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
  const [isPaymentCompleted, setIsPaymentCompleted] = useState(false);
  const [printTrigger, setPrintTrigger] = useState(false);

  const [createOrder, { loading }] = useMutation(CREATE_ORDER, {
    onCompleted: () => {
      reloadStock();
      reloadLastOrder();
      setNewOrderList([]);
      setDiscountData({ type: "", value: 0 });
      setIsPaymentCompleted(true);
      onClose();
      setPrintTrigger(true);
    },
    onError: (error) => {
      console.error("Error creating order:", error);
    },
  });

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

  // Generate quick pay amounts
  const generateQuickPayAmounts = (total: number) => {
    const baseAmounts = [];
    for (let i = 1; i <= 20; i++) {
      baseAmounts.push(i * 50000);
    }
    const greaterAmounts = baseAmounts.filter((amount) => amount > total);
    if (greaterAmounts.length === 0) {
      greaterAmounts.push(total + 50000);
    }
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
      setPayment((prev) => ({
        ...prev,
        transfer_lak: totalFinal.lak,
        transfer_bath: 0,
        transfer_usd: 0,
      }));
    } else if (
      paymentMethod === "CASH" ||
      paymentMethod === "CASH_AND_TRANSFER"
    ) {
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
    setOrders(orders.filter((order) => order.id !== currentOrderId));
    setCurrentOrderId(orders[0]?.id || "");
    if (orders.length <= 1) {
      const newOrderId = uuidv4();
      setOrders([{ id: newOrderId, items: [] }]);
      setCurrentOrderId(newOrderId);
    }
    
    (printRef.current?.parentElement as any)?.querySelector("button")?.click();
  };

  const handleModalClose = () => {
    if (!isPaymentCompleted) {
      onClose();
    } else {
      onClose();
    }
  };

  const isPaymentMatched = (fieldValue: number, total: number) => {
    return fieldValue >= total && fieldValue > 0;
  };

  const getInputStyle = (field: keyof typeof payment) => ({
    width: "100%",
    borderColor: isPaymentMatched(payment[field], totalFinal.lak) ? '#52c41a' : undefined,
    backgroundColor: isPaymentMatched(payment[field], totalFinal.lak) ? '#f6ffed' : undefined,
  });

  const handlePrintComplete = () => {
    onOrderCompleted?.();
  };

  useEffect(() => {
    if (printTrigger && printRef.current) {
      (printRef.current.parentElement as any)?.querySelector("button")?.click();
    }
  }, [printTrigger]);

  // Get payment status for styling
  const getPaymentStatus = () => {
    if (totalPayment > totalFinal.lak) return "change";
    if (totalPayment === totalFinal.lak) return "exact";
    return "insufficient";
  };

  const paymentStatus = getPaymentStatus();

  return (
    <Modal
      open={isPayments}
      footer={null}
      onCancel={handleModalClose}
      onClose={handleModalClose}
      width={800}
      style={{ fontFamily: "Phetsarath OT, sans-serif" }}
      title={
        <Title level={4} style={{ margin: 0 }}>
          <Flex align="center" gap={12}>
            <DollarOutlined />
            ຊຳລະເງິນ
          </Flex>
        </Title>
      }
      centered
    >
      <Flex gap={24} style={{ padding: '16px 0' }}>
        {/* Left side - Payment details */}
        <div style={{ flex: 3 }}>
          {/* Payment Status Banner */}
          <Card 
            style={{ 
              marginBottom: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              borderRadius: 8,
              overflow: 'hidden'
            }}
            bodyStyle={{ padding: 0 }}
            bordered={false}
          >
            <div
              style={{
                background:
                  paymentStatus === "change"
                    ? "linear-gradient(45deg, #52c41a, #95de64)"
                    : paymentStatus === "exact"
                    ? "linear-gradient(45deg, #1677ff, #69b1ff)"
                    : "linear-gradient(45deg, #d32f2f, #f44336)",
                color: "white",
                padding: 16,
                textAlign: "center",
              }}
            >
              <Flex align="center" justify="center" gap={8}>
                {paymentStatus === "change" && <CheckCircleOutlined style={{ fontSize: 24 }} />}
                {paymentStatus === "exact" && <CheckCircleOutlined style={{ fontSize: 24 }} />}
                {paymentStatus === "insufficient" && <CloseCircleOutlined style={{ fontSize: 24 }} />}
                
                <Title level={3} style={{ margin: 0, color: "white" }}>
                  {paymentStatus === "change"
                    ? `ເງິນທອນ: ${formatNumber(changeAmount)} ກີບ`
                    : paymentStatus === "exact"
                    ? `ຮັບເງິນຄົບຖ້ວນ: ${formatNumber(totalFinal.lak)} ກີບ`
                    : `ເງິນບໍ່ພໍ: ${formatNumber(Math.abs(changeAmount))} ກີບ`}
                </Title>
              </Flex>
            </div>
            
            <div style={{ padding: 16, background: "#f9f9f9" }}>
              <Flex justify="space-between" align="center">
                <Text>ຍອດຊຳລະ:</Text>
                <Text strong style={{ fontSize: 16 }}>{formatNumber(totalFinal.lak)} ກີບ</Text>
              </Flex>
              <Flex justify="space-between" align="center" style={{ marginTop: 8 }}>
                <Text>ຍອດຮັບ:</Text>
                <Text strong style={{ fontSize: 16 }}>{formatNumber(totalPayment)} ກີບ</Text>
              </Flex>
            </div>
          </Card>

          {/* Payment Method Tabs */}
          <Card 
            style={{ marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            bodyStyle={{ padding: 16 }}
          >
            <Tabs 
              defaultActiveKey="payment-method" 
              style={{ marginBottom: 16 }}
              tabBarStyle={{ marginBottom: 16 }}
            >
              <TabPane 
                tab={
                  <span>
                    <span style={{ fontWeight: paymentMethod ? 'normal' : 'bold' }}>ວິທີການຊຳລະ</span>
                    {paymentMethod && <Badge status="success" style={{ marginLeft: 8 }} />}
                  </span>
                } 
                key="payment-method"
              >
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                  <Flex gap={8}>
                    {[
                      { key: "CASH", label: "ເງິນສົດ", icon: <DollarOutlined />, color: "#52c41a" },
                      { key: "TRANSFER", label: "ເງິນໂອນ", icon: <BankOutlined />, color: "#1677ff" },
                      { key: "CASH_AND_TRANSFER", label: "ເງິນສົດ ແລະ ໂອນ", icon: <DollarOutlined />, color: "#722ed1" },
                    ].map((method) => (
                      <Button
                        key={method.key}
                        onClick={() => setPaymentMethod(method.key as any)}
                        type={paymentMethod === method.key ? "primary" : "default"}
                        icon={method.icon}
                        size="large"
                        style={{ 
                          flex: 1, 
                          height: 60,
                          fontSize: 16,
                          color: paymentMethod === method.key ? method.color : method.color,
                          borderWidth: paymentMethod === method.key ? 2 : 1,
                          borderColor: paymentMethod === method.key ? method.color : undefined,
                          background: paymentMethod === method.key ? `${method.color}10` : undefined
                        }}
                      >
                        {method.label}
                      </Button>
                    ))}
                  </Flex>
                </Space>
              </TabPane>
            </Tabs>

            {/* Payment Form */}
            {paymentMethod && (
              <div>
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  {paymentMethod === "CASH" && (
                    <>
                      <Card size="small" title="ເງິນສົດ" style={{ marginBottom: 8 }}>
                        <Space direction="vertical" style={{ width: "100%" }}>
                          <Flex justify="space-between" align="center" gap={16}>
                            <Text strong>ເງິນສົດ (ກີບ):</Text>
                            <InputNumber
                              min={0}
                              value={payment.cash_lak}
                              onChange={handlePaymentChange("cash_lak")}
                              formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                              }
                              size="large"
                              style={getInputStyle("cash_lak")}
                            />
                          </Flex>
                          
                          <Flex gap={8} style={{ marginTop: 12 }}>
                            <Button
                              onClick={() => quickPay(totalFinal.lak)}
                              type="primary"
                              style={{ flex: 1, height: 42, fontSize: 16 }}
                            >
                              ພໍດີ ({formatNumber(totalFinal.lak)})
                            </Button>
                            {quickPayAmounts.map((amount) => (
                              <Button
                                key={amount}
                                onClick={() => quickPay(amount)}
                                style={{ flex: 1, height: 42 }}
                              >
                                {formatNumber(amount)}
                              </Button>
                            ))}
                          </Flex>
                        </Space>
                      </Card>
                      
                      <Card size="small" title="ສະກຸນເງິນອື່ນ" style={{ marginBottom: 8 }}>
                        <Space direction="vertical" style={{ width: "100%" }}>
                          <Flex justify="space-between" align="center" gap={16}>
                            <Text>ເງິນສົດ (ບາດ):</Text>
                            <InputNumber
                              min={0}
                              value={payment.cash_bath}
                              onChange={handlePaymentChange("cash_bath")}
                              formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                              }
                              size="large"
                              style={getInputStyle("cash_bath")}
                            />
                          </Flex>
                          <Flex justify="space-between" align="center" gap={16}>
                            <Text>ເງິນສົດ (USD):</Text>
                            <InputNumber
                              min={0}
                              value={payment.cash_usd}
                              onChange={handlePaymentChange("cash_usd")}
                              formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                              }
                              size="large"
                              style={getInputStyle("cash_usd")}
                            />
                          </Flex>
                        </Space>
                      </Card>
                    </>
                  )}
                  
                  {paymentMethod === "TRANSFER" && (
                    <Card size="small" title="ເງິນໂອນ">
                      <Flex justify="space-between" align="center" gap={16}>
                        <Text strong>ໂອນ (ກີບ):</Text>
                        <InputNumber
                          min={0}
                          value={payment.transfer_lak}
                          onChange={handlePaymentChange("transfer_lak")}
                          formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          size="large"
                          style={getInputStyle("transfer_lak")}
                        />
                      </Flex>
                    </Card>
                  )}
                  
                  {paymentMethod === "CASH_AND_TRANSFER" && (
                    <>
                      <Card size="small" title="ເງິນສົດ" style={{ marginBottom: 8 }}>
                        <Flex justify="space-between" align="center" gap={16}>
                          <Text strong>ເງິນສົດ (ກີບ):</Text>
                          <InputNumber
                            min={0}
                            value={payment.cash_lak}
                            onChange={handlePaymentChange("cash_lak")}
                            formatter={(value) =>
                              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            size="large"
                            style={getInputStyle("cash_lak")}
                          />
                        </Flex>
                      </Card>
                      
                      <Card size="small" title="ເງິນໂອນ">
                        <Flex justify="space-between" align="center" gap={16}>
                          <Text strong>ໂອນ (ກີບ):</Text>
                          <InputNumber
                            min={0}
                            value={payment.transfer_lak}
                            onChange={handlePaymentChange("transfer_lak")}
                            formatter={(value) =>
                              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            size="large"
                            style={getInputStyle("transfer_lak")}
                          />
                        </Flex>
                      </Card>
                    </>
                  )}
                </Space>
                
                {/* Action Buttons */}
                <Flex justify="space-between" style={{ marginTop: 24 }}>
                  <Button 
                    onClick={handleModalClose} 
                    size="large"
                    icon={<CloseCircleOutlined />}
                    style={{ width: 120, height: 50, }}
                  >
                    ປິດ
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    icon={<PrinterOutlined />}
                    onClick={handleSaveAndPrint}
                    disabled={loading || !paymentMethod || totalPayment < totalFinal.lak}
                    style={{ 
                      width: "70%", 
                      height: 50,
                      fontSize: 16,
                      background: totalPayment >= totalFinal.lak ? "#52c41a" : undefined
                    }}
                  >
                    ຮັບເງິນ ແລະ ພິມບິນ
                  </Button>
                </Flex>
              </div>
            )}
          </Card>
        </div>

        {/* Right side - Order summary */}
        <div style={{ flex: 2 }}>
          <Card 
            title="ສະຫຼຸບລາຍການ" 
            style={{ 
              height: "100%", 
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              background: "#f9f9f9"
            }}
          >
            <div style={{ maxHeight: 400, overflowY: 'auto', padding: '0 4px' }}>
              {newOrderList.map((item) => (
                <Card 
                  key={item.productId} 
                  size="small" 
                  style={{ marginBottom: 8, background: "#fff" }}
                >
                  <Text strong>{item.productName}</Text>
                  <Flex justify="space-between" style={{ marginTop: 4 }}>
                    <Text type="secondary">{formatNumber(item.order_qty)} x {formatNumber(item.price_sale)}</Text>
                    <Text>{formatNumber(item.order_total_price)} ກີບ</Text>
                  </Flex>
                </Card>
              ))}
            </div>
            
            <Divider style={{ margin: '16px 0' }} />
            
            <Space direction="vertical" style={{ width: "100%" }}>
              <Flex justify="space-between">
                <Text>ລວມ:</Text>
                <Text>{formatNumber(newOrderList.reduce((acc, item) => acc + item.order_total_price, 0))} ກີບ</Text>
              </Flex>
              
              {discountData.type && (
                <Flex justify="space-between">
                  <Text>ສ່ວນຫຼຸດ {discountData.type === "PERCENT" ? `(${discountData.value}%)` : "(ເງິນສົດ)"}:</Text>
                  <Text>
                    {formatNumber(
                      discountData.type === "PERCENT"
                        ? (newOrderList.reduce((acc, item) => acc + item.order_total_price, 0) * discountData.value) / 100
                        : discountData.value
                    )} ກີບ
                  </Text>
                </Flex>
              )}
              
              <Divider style={{ margin: '8px 0' }} />
              
              <Flex justify="space-between">
                <Text strong>ຍອດຊຳລະຈິງ:</Text>
                <Text strong style={{ fontSize: 16, color: "#1677ff" }}>{formatNumber(totalFinal.lak)} ກີບ</Text>
              </Flex>
              
              <Flex justify="space-between">
                <Text type="secondary">ຄ່າບາດ:</Text>
                <Text type="secondary">{formatNumber(totalFinal.bath)} ບາດ</Text>
              </Flex>
            </Space>
          </Card>
        </div>
      </Flex>

      {/* Print Component */}
      <div style={{ display: "none" }}>
        <ReactToPrint
          trigger={() => <button />}
          content={() => printRef.current}
          onAfterPrint={handlePrintComplete}
          onPrintError={handlePrintComplete}
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

export default PosPayment;