import {
  Affix,
  Col,
  Divider,
  Drawer,
  Flex,
  InputNumber,
  message,
  Row,
  Space,
} from "antd";
import React, { useEffect, useState } from "react";
import stylesStock from "../../../styles/PosMobil.module.css";
import { formatNumber, getUserDataFromLCStorage } from "../../../utils/helper";
import { context } from "../../../hooks/Context";
import { FaMinusCircle } from "react-icons/fa";
import { FaCirclePlus } from "react-icons/fa6";
import { CiTrash } from "react-icons/ci";
import { calculatediscount } from "../../pos/component/calculateDiscount";
import { generateOrderNo } from "../../pos/component/generateOrderNo";
import { CREATE_ORDER } from "../../../services";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import routes from "../../../utils/routes";

interface Props {
  open: boolean;
  onClose: () => void;
  reloadStock: () => void;
  reloadLastOrder: () => void;
  lastOrder: any;
}

const PaymentMobile: React.FC<Props> = ({
  open,
  onClose,
  reloadStock,
  reloadLastOrder,
  lastOrder,
}) => {
  const [isTakeMoney, setIsTakeMoney] = useState<boolean>(false);
  const { totalOrderPrice,cart } = context();


  useEffect(() => {
    if(cart.length === 0){
        onClose();
    }
  },[cart])

  return (
    <div>
      <Drawer
        title="ຊຳລະເງິນ"
        onClose={onClose}
        open={open}
        width={"100%"}
        style={{ padding: 0 }}
      >
        {!isTakeMoney && (
          <>
            <OrderList />

            <div style={{ height: 50 }}></div>

            <Affix offsetBottom={0}>
              <div
                style={{
                  backgroundColor: "#ff9800",
                  position: "fixed", // ✅ ใช้ fixed เพื่อให้ติดด้านล่างเสมอ
                  bottom: 0,
                  left: 0,
                  width: "100%",
                  zIndex: 10,
                }}
              >
                <Flex justify="space-between" align="center">
                  <div
                    style={{ backgroundColor: "#000", flex: 2, padding: 10 }}
                  >
                    <div style={{ color: "white", fontSize: 20 }}>
                      ລວມ: {formatNumber(totalOrderPrice || 0)} ກີບ
                    </div>
                  </div>
                  <div
                    style={{
                      flex: 1, // ✅ ทำให้ปุ่มยืดตามพื้นที่ที่เหลือ
                      padding: 10,
                      color: "#fff",
                      textAlign: "center",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontSize: 20,
                    }}
                    onClick={() => setIsTakeMoney(true)}
                  >
                    ຮັບເງິນ
                  </div>
                </Flex>
              </div>
            </Affix>
          </>
        )}

        {isTakeMoney && (
          <PaymentForm
            setIsTakeMoney={setIsTakeMoney}
            reloadStock={reloadStock}
            reloadLastOrder={reloadLastOrder}
            lastOrder={lastOrder}
          />
        )}
      </Drawer>
    </div>
  );
};

interface TotalPay {
  cash_lak?: number;
  cash_bath?: number;
  cash_usd?: number;
  transfer_lak?: number;
  transfer_bath?: number;
  transfer_usd?: number;
  amount?: number; // This is the total amount in LAK
}

interface PaymentProps {
  setIsTakeMoney: (data: boolean) => void;
  reloadStock: () => void;
  reloadLastOrder: () => void;
  lastOrder: any;
}

const PaymentForm: React.FC<PaymentProps> = ({
  setIsTakeMoney,
  reloadStock,
  reloadLastOrder,
  lastOrder,
}) => {
  const {
    totalOrderPrice,
    cart,
    exchange,
    totalCommission,
    setCart,
    totalOriginPrice,
  } = context();
  const branchInfo = getUserDataFromLCStorage();
  const navigate = useNavigate();
  //generate order no
  const orderNo = lastOrder?.getLastOder?.order_no
    ? generateOrderNo(lastOrder.getLastOder)
    : "VIXAY-00000001";

  // ตั้งชื่อตัวแปรให้มีความหมาย
  const [isEqualTotal, setIsEqualTotal] = useState<boolean>(false);
  const [typePay, setTypePay] = useState<string | null>(null);
  const [discount, setDiscount] = useState<number>(0);
  const [totalFinal, setTotalFinal] = useState<{
    lak: number;
    bath: number;
    usd: number;
  }>({
    lak: 0,
    bath: 0,
    usd: 0,
  });
  const [totalPay, setTotalPay] = useState<TotalPay>({
    cash_lak: 0,
    cash_bath: 0,
    cash_usd: 0,
    transfer_lak: 0,
    transfer_bath: 0,
    transfer_usd: 0,
    amount: 0,
  });

  const [createOrder, { loading: createOrderLoading }] = useMutation(
    CREATE_ORDER,
    {
      onCompleted: () => {
        reloadStock();
        reloadLastOrder();
      },
    }
  );

  // แยกฟังก์ชันคำนวณส่วนลดออกมา
  const calculateDiscountEffect = () => {
    if (discount > 0) {
      const result = calculatediscount(
        "AMOUNT",
        discount,
        totalOrderPrice,
        exchange
      );
      setTotalFinal(result);
    } else {
      setTotalFinal({
        lak: Math.round(totalOrderPrice),
        bath: Math.round(totalOrderPrice / (exchange?.bath || 1)),
        usd: Math.round(totalOrderPrice / (exchange?.usd || 1)),
      });
    }
  };

  useEffect(calculateDiscountEffect, [cart, discount]);

  // แยกฟังก์ชันคำนวณจำนวนเงินออกมา
  const calculateTotalAmountEffect = () => {
    const calculateAmount = (currency: string, exchangeRate?: number) => {
      const amount = totalPay[currency as keyof TotalPay] || 0;
      return amount * (exchangeRate || 1);
    };

    const calculatedAmount = [
      { key: "cash_lak", rate: 1 },
      { key: "cash_bath", rate: exchange.bath },
      { key: "transfer_lak", rate: 1 },
      { key: "transfer_bath", rate: exchange.bath },
    ].reduce((acc, { key, rate }) => acc + calculateAmount(key, rate), 0);

    if (totalPay.amount !== calculatedAmount) {
      setTotalPay((prev) => ({ ...prev, amount: calculatedAmount }));
    }
  };

  useEffect(calculateTotalAmountEffect, [totalPay, exchange]);

  useEffect(() => {
    const getOverrides = () => {
      if (typePay === "CASH" && isEqualTotal) {
        return { cash_lak: totalFinal.lak };
      }
      if (typePay === "TRANSFER" && isEqualTotal) {
        return { transfer_lak: totalFinal.lak, amount: 0 };
      }
      if (typePay === "CASH_AND_TRANSFER" && isEqualTotal) {
        return { cash_lak: totalFinal.lak, amount: 0 };
      }
      return { cash_lak: 0, transfer_lak: 0, amount: 0 };
    };

    const overrides = getOverrides();
    setTotalPay((prevState) => ({ ...prevState, ...overrides }));
  }, [isEqualTotal, typePay, totalFinal.lak]);

  // แยกฟังก์ชันรีเซ็ตจำนวนเงินออกมา
  const resetTotalPayEffect = () => {
    const resetTotalPay = (overrides = {}) => {
      setTotalPay({
        cash_lak: 0,
        cash_bath: 0,
        transfer_lak: 0,
        transfer_bath: 0,
        amount: 0,
        ...overrides,
      });
    };

    switch (typePay) {
      case "CASH":
      case "CASH_AND_TRANSFER":
        resetTotalPay();
        break;
      case "TRANSFER":
        resetTotalPay({ transfer_lak: totalFinal.lak });
        break;
      default:
        resetTotalPay();
    }
  };

  useEffect(resetTotalPayEffect, [typePay]);

  // คำนวณเงินทอน
  const changeAmount = totalPay?.amount
    ? (totalPay?.amount || 0) - (totalFinal?.lak || 0)
    : null;
  const isInsufficient = changeAmount !== null && changeAmount < 0;
  const isSufficient = changeAmount !== null && changeAmount > 0;

  const handleChangeDiscount = (value: number | null) => {
    // ตรวจสอบว่า value เป็น null หรือไม่
    if (value === null) {
      return;
    }

    // ตรวจสอบค่าของ value ตามประเภทของส่วนลด
    if (value > totalOrderPrice) {
      setDiscount(value);
      setTotalFinal({ lak: 0, bath: 0, usd: 0 });
      return message.warning("ທ່ານປ້ອນສ່ວນຫຼຸດເກີນລາຄາສິນຄ້າ");
    }

    // อัปเดตค่า discount
    setDiscount(value);
  };

  const _handleSaveAndPrintBill = async () => {
    try {
      // ตรวจสอบเงื่อนไขก่อนดำเนินการ
      if (createOrderLoading) return;
      if (isInsufficient)
        return message.warning("ກະລຸນາປ້ອນຈຳນວນເງິນໃຫ້ພຽງພໍກັບຄ່າສິນຄ້າ");
      if (!typePay) return message.warning("ກະລຸນາເລືອກປະເພດຊຳລະ");

      const amountDue = (totalPay?.amount || 0) - (totalFinal?.lak || 0);
      if (amountDue < 0) {
        return message.warning("ກະລຸນາປ້ອນຈຳນວນເງິນ");
      }

      const _data = {
        order_no: orderNo,
        branchId: branchInfo?.branchId?.id,
        branchName: branchInfo?.branchId?.branchName,
        order_items: cart,
        total_price: totalOrderPrice,
        totalCommission: totalCommission,
        discount_type: discount > 0 ? "AMOUNT" : "NOT_DISCOUNT",
        discount: discount,
        discount_total: discount,
        exchangeRate: {
          bath: exchange?.bath,
          usd: exchange?.usd,
        },
        typePay: typePay,
        cash_lak: totalPay?.cash_lak,
        cash_bath: totalPay?.cash_bath,
        transfer_lak: totalPay?.transfer_lak,
        transfer_bath: totalPay?.transfer_bath,
        totalOriginPrice: totalOriginPrice,
        final_receipt_total: totalFinal?.lak,
        send_back_customer: (totalPay?.amount || 0) - totalFinal?.lak,
        overall_status: "PAYMENTED",
      };

      // เรียกใช้ฟังก์ชันสร้างคำสั่งซื้อ
      const resultUpdate = await createOrder({
        variables: { data: _data },
      });

      if (resultUpdate?.data?.createOrder?.id) {
        message.success("ຊຳລະເງິນສຳເລັດ");
        setCart([]);
        setDiscount(0);
        setTotalPay({
          cash_lak: 0,
          cash_bath: 0,
          cash_usd: 0,
          transfer_lak: 0,
          transfer_bath: 0,
          transfer_usd: 0,
          amount: 0,
        });
        setTotalFinal({
          lak: 0,
          bath: 0,
          usd: 0,
        });
        setTypePay("");
        navigate(routes.BILL_MOBILE_PAGE+'/'+resultUpdate?.data?.createOrder?.id)
      }
    } catch (error) {
      message.error("ກຸລາລອງໃໝ່ອີກຄັ້ງ");
      console.error("Error occurred during order processing:", error);
    }
  };

  const amountDue = (totalPay?.amount || 0) - (totalFinal?.lak || 0);

  return (
    <div>
      <div
        style={{
          backgroundColor: isInsufficient
            ? "red"
            : !isInsufficient && !isSufficient && changeAmount !== null
            ? "green"
            : "#1976d2",
          padding: 10,
          textAlign: "center",
        }}
      >
        {isSufficient && (
          <div style={{ color: "#fff", fontSize: 20, fontWeight: 900 }}>
            ເງິນທອນກີບ: {formatNumber(changeAmount)}
          </div>
        )}

        {isInsufficient && (
          <div style={{ color: "#fff", fontSize: 20, fontWeight: 900 }}>
            ເງິນບໍ່ພໍ: {formatNumber(changeAmount)}
          </div>
        )}

        {!isInsufficient && !isSufficient && changeAmount !== null && (
          <div style={{ color: "#fff", fontSize: 20, fontWeight: 900 }}>
            ເງິນຄົບພໍດີ: {formatNumber(totalFinal.lak)}
          </div>
        )}

        {changeAmount === null && (
          <div>
            <div style={{ color: "#fff", fontSize: 20, fontWeight: 900 }}>
              ເງິນທີ່ຕ້ອງຮັບ
            </div>
            <Divider style={{ margin: 0 }} />
            <Flex
              justify={"space-around"}
              align={"center"}
              style={{ color: "#fff", fontSize: 20, fontWeight: 900 }}
            >
              <div>ກີບ: {formatNumber(totalFinal.lak)}</div>
              <div>ບາດ: {formatNumber(totalFinal.bath)}</div>
            </Flex>
          </div>
        )}
      </div>

      <Row
        style={{
          textAlign: "center",
          fontWeight: "bold",
          backgroundColor: "lightgray",
        }}
      >
        <Col
          span={8}
          onClick={() => {
            setTypePay("CASH");
            setIsEqualTotal(false);
          }}
          className={`type-pay  ${typePay === "CASH" ? "active-payment" : ""}`}
        >
          ເງິນສົດ
        </Col>
        <Col
          span={8}
          onClick={() => {
            setTypePay("TRANSFER");
            setIsEqualTotal(false);
          }}
          className={`type-pay  ${
            typePay === "TRANSFER" ? "active-payment" : ""
          }`}
        >
          ເງິນໂອນ
        </Col>
        <Col
          span={8}
          onClick={() => {
            setTypePay("CASH_AND_TRANSFER");
            setIsEqualTotal(false);
          }}
          className={`type-pay  ${
            typePay === "CASH_AND_TRANSFER" ? "active-payment" : ""
          }`}
        >
          ສົດ ແລະ ໂອນ
        </Col>
      </Row>

      <div style={{ lineHeight: "30px" }}>
        <div>ປ້ອນສ່ວນຫລຸດ</div>
        <InputNumber
          size="large"
          autoComplete="off"
          placeholder="ປ້ອນສ່ວນຫລຸດ(ເປີເຊັນ ຫຼື ກີບ)"
          min={0}
          style={{ width: "100%" }}
          value={discount}
          formatter={(value) =>
            value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
          }
          parser={(value) => (value ? parseFloat(value.replace(/,/g, "")) : 0)}
          onChange={(value) => handleChangeDiscount(value as number | null)}
        />
      </div>

      <Divider style={{ margin: "10px 0px" }} />
      {/* cash lak */}
      <Row gutter={10}>
        {/* get lak */}
        <Col span={4} style={{ fontSize: 14, textAlign: "right" }}>
          ສົດກີບ
        </Col>
        <Col span={20}>
          <InputNumber
            size="large"
            autoComplete="off"
            min={0}
            placeholder="ປ້ອນຈຳນວນເງິນ"
            style={{ width: "100%" }}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => parseFloat(value?.replace(/,/g, "") || "0")}
            value={totalPay.cash_lak}
            onChange={(value: number | null) => {
              setTotalPay((prev) => ({
                ...prev,
                cash_lak: value || 0,
              }));
            }}
            disabled={typePay !== "CASH" && typePay !== "CASH_AND_TRANSFER"}
          />
        </Col>
      </Row>
      <div style={{ height: 10 }}></div>
      <Row gutter={10}>
        {/* get bath */}
        <Col span={4} style={{ fontSize: 14, textAlign: "right" }}>
          ສົດບາດ
        </Col>
        <Col span={20}>
          <InputNumber
            size="large"
            autoComplete="off"
            placeholder="ປ້ອນຈຳນວນເງິນ"
            style={{ width: "100%" }}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) =>
              value ? parseFloat(value.replace(/(,*)/g, "")) : 0
            }
            value={totalPay.cash_bath}
            onChange={(value: number | null) => {
              setTotalPay((prev) => ({
                ...prev,
                cash_bath: value || 0,
              }));
            }}
            disabled={typePay !== "CASH" && typePay !== "CASH_AND_TRANSFER"}
          />
        </Col>
      </Row>
      <div style={{ height: 10 }}></div>

      <Divider style={{ margin: "10px 0px" }} />

      {/* transfer lak */}
      <Row gutter={10}>
        {/* get lak */}
        <Col span={4} style={{ fontSize: 14, textAlign: "right" }}>
          ໂອນກີບ
        </Col>
        <Col span={20}>
          <InputNumber
            size="large"
            autoComplete="off"
            placeholder="ປ້ອນຈຳນວນເງິນ"
            style={{ width: "100%" }}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) =>
              value ? parseFloat(value.replace(/(,*)/g, "")) : 0
            }
            value={totalPay.transfer_lak}
            onChange={(value: number | null) => {
              setTotalPay((prev) => ({
                ...prev,
                transfer_lak: value || 0,
              }));
            }}
            disabled={typePay !== "TRANSFER" && typePay !== "CASH_AND_TRANSFER"}
          />
        </Col>
      </Row>
      <div style={{ height: 10 }}></div>
      <Row gutter={10}>
        {/* get bath */}
        <Col span={4} style={{ fontSize: 14, textAlign: "right" }}>
          ໂອນບາດ
        </Col>
        <Col span={20}>
          <InputNumber
            size="large"
            autoComplete="off"
            placeholder="ປ້ອນຈຳນວນເງິນ"
            style={{ width: "100%" }}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) =>
              value ? parseFloat(value.replace(/(,*)/g, "")) : 0
            }
            value={totalPay.transfer_bath}
            onChange={(value: number | null) => {
              setTotalPay((prev) => ({
                ...prev,
                transfer_bath: value || 0,
              }));
            }}
            disabled={typePay !== "TRANSFER" && typePay !== "CASH_AND_TRANSFER"}
          />
        </Col>
      </Row>
      <div style={{ height: 10 }}></div>

      <Divider style={{ margin: "10px 0px" }} />
      <div
        style={{
          borderRadius: "5px",
          fontSize: 18,
          border: "1px solid lightgray",
          textAlign: "center",
          padding: 8,
          backgroundColor: isEqualTotal ? "green" : "",
          color: isEqualTotal ? "white" : "",
        }}
        className="footer-payment"
        onClick={() => setIsEqualTotal(!isEqualTotal)}
      >
        ຈຳນວນເງິນພໍດີ
      </div>

      <Affix offsetBottom={0}>
        <div
          style={{
            backgroundColor:
              isInsufficient || !typePay || amountDue < 0 ? "red" : "green",
            position: "fixed", // ✅ ใช้ fixed เพื่อให้ติดด้านล่างเสมอ
            bottom: 0,
            left: 0,
            width: "100%",
            zIndex: 10,
          }}
        >
          <Flex justify="space-between" align="center">
            <div
              style={{ backgroundColor: "lightgray", padding: 10 }}
              onClick={() => setIsTakeMoney(false)}
            >
              <div style={{ color: "white", fontSize: 20 }}>ກັບຄືນ</div>
            </div>
            <div style={{ flex: 2 }}>
              <div
                style={{
                  flex: 1, // ✅ ทำให้ปุ่มยืดตามพื้นที่ที่เหลือ
                  padding: 10,
                  color: "#fff",
                  textAlign: "center",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: 20,
                }}
                onClick={_handleSaveAndPrintBill}
              >
                {isInsufficient
                  ? "ປ້ອນເງິນໃຫ້ຄົບ"
                  : !typePay
                  ? "ເລືອກປະເພດຊຳລະ"
                  : amountDue < 0
                  ? "ປ້ອນຈຳນວນເງິນ"
                  : "ຢືນຢັນຮັບເງິນ"}
              </div>
            </div>
          </Flex>
        </div>
      </Affix>
    </div>
  );
};

const OrderList: React.FC = () => {
  const { decreaseQuantity, increaseQuantity, removeFromCart, cart } =
    context();
  return (
    <>
      {cart &&
        cart?.map((item: any) => (
          <div key={item?.productId} className={stylesStock.cardList}>
            <div className={stylesStock.cardDetail}>
              <Flex justify="space-between" align="center">
                <div className={stylesStock.title}>{item?.productName}</div>
                <div
                  className={stylesStock.buttonQty}
                  onClick={() => removeFromCart(item?.productId)}
                >
                  <CiTrash style={{ color: "red", fontSize: 18 }} />
                </div>
              </Flex>
              <div className={stylesStock.subtitle}>
                <span style={{ color: "gray" }}>ລາຄາ</span>{" "}
                {formatNumber(item?.price_sale || 0)} ກີບ
              </div>

              <div style={{ height: 10 }}></div>

              <Flex justify="space-between" align="center">
                <div className={stylesStock.textTotal}>
                  {formatNumber(item?.order_total_price || 0)} ກີບ
                </div>
                <div>
                  <Space>
                    <span
                      className={stylesStock.buttonQty}
                      onClick={() => decreaseQuantity(item?.productId)}
                    >
                      <FaMinusCircle />
                    </span>
                    <span style={{ fontSize: 18 }}>
                      {formatNumber(item?.order_qty)}
                    </span>
                    <span
                      className={stylesStock.buttonQty}
                      onClick={() => increaseQuantity(item?.productId)}
                    >
                      <FaCirclePlus />
                    </span>
                  </Space>
                </div>
              </Flex>
            </div>
          </div>
        ))}
    </>
  );
};

export default PaymentMobile;
