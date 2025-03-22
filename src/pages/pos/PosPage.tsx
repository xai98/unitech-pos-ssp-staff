import { Col, Row} from "antd"; // เพิ่ม Popconfirm สำหรับการยืนยันลบบิล
import { useEffect, useState, useMemo } from "react";
import ProductList from "./ProductList";
import PosOrderList from "./PosOrderList";
import PosPayement from "./PosPayment";
import { consts } from "../../utils";
import { useLazyQuery, useQuery } from "@apollo/client";
import {
  CATEGORIES,
  GET_BRANCH_STOCKS,
  GET_EXCHANGE,
  GET_LAST_ORDER,
} from "../../services";
import { getUserDataFromLCStorage } from "../../utils/helper";
import { v4 as uuidv4 } from "uuid"; // เพิ่ม uuid เพื่อสร้าง ID บิล
import OrderBillSection from "./OrderBillSection";

interface Order {
  id: string;
  items: any[];
}

const PosPage: React.FC = () => {
  const branchInfo = getUserDataFromLCStorage();
  const [filter, setFilter] = useState({ categoryId: "ALL", productName: "" });
  const [orders, setOrders] = useState<Order[]>([{ id: uuidv4(), items: [] }]); // รายการบิลทั้งหมด
  const [currentOrderId, setCurrentOrderId] = useState<string>(orders[0].id); // บิลที่กำลังเลือก
  const [discountData, setDiscountData] = useState({ type: "", value: 0 });
  const [exchange, setExchange] = useState({ bath: 0, usd: 0, cny: 0 });

  const [isPayments, setIsPayments] = useState(false);
  const [triggerFocus, setTriggerFocus] = useState(false);
  
  const handleOrderCompleted = () => {
    setTriggerFocus(prev => !prev); // toggle ค่าเพื่อ trigger useEffect
  };


  // Optimize queries with better caching
  const [loadExchange] = useLazyQuery(GET_EXCHANGE, {
    variables: { where: { id: consts.EXCHNAGE_ID } },
    fetchPolicy: "cache-first",
  });

  const { data: categoryData } = useQuery(CATEGORIES, {
    fetchPolicy: "cache-first",
  });

  const {
    loading,
    data: stockData,
    refetch: reloadStock,
  } = useQuery(GET_BRANCH_STOCKS, {
    variables: {
      where: { branchId: branchInfo?.branchId?.id, isShowSale: true },
    },
    fetchPolicy: "cache-and-network",
  });

  const { data: lastOrder, refetch: reloadLastOrder } = useQuery(
    GET_LAST_ORDER,
    {
      variables: { where: { branchId: branchInfo?.branchId?.id } },
      fetchPolicy: "cache-first",
    }
  );

  useEffect(() => {
    handleOrderCompleted();
  },[])

  // Optimize exchange rate loading
  useEffect(() => {
    const storedExchange = localStorage.getItem("VIXAY_POS");
    if (storedExchange) {
      setExchange(JSON.parse(storedExchange));
    } else {
      loadExchange().then(({ data }) => {
        if (data?.exchangeRate) {
          const rates = data.exchangeRate;
          setExchange(rates);
          localStorage.setItem("VIXAY_POS", JSON.stringify(rates));
        }
      });
    }
  }, [loadExchange]);

  // Memoize current order to ensure it always has a valid structure
  const currentOrder = useMemo(() => {
    const order = orders.find((order) => order.id === currentOrderId) || {
      id: "",
      items: [],
    };
    // console.log("Current Order in PosPage:", order);
    return { ...order, items: Array.isArray(order.items) ? order.items : [] };
  }, [orders, currentOrderId]);

  // Memoize total calculation for current order with safety check
  const totalFinal = useMemo(() => {
    const items = currentOrder.items || [];
    const subtotal = Array.isArray(items)
      ? items.reduce((sum, item) => sum + (item.order_total_price || 0), 0)
      : 0;
    console.log("Calculating totalFinal in PosPage:", { items, subtotal });
    let finalLak = subtotal;
    if (discountData.type === "PERCENT") {
      finalLak = subtotal * (1 - discountData.value / 100);
    } else if (discountData.type === "AMOUNT") {
      finalLak = subtotal - discountData.value;
    }
    return {
      lak: Math.round(finalLak),
      bath: Math.round(finalLak / (exchange.bath || 1)),
      usd: Math.round(finalLak / (exchange.usd || 1)),
    };
  }, [currentOrder.items, discountData, exchange]);

  // เพิ่มบิลใหม่
  const addNewOrderBill = () => {
    const newOrderId = uuidv4();
    setOrders([...orders, { id: newOrderId, items: [] }]);
    setCurrentOrderId(newOrderId);
  };

  // สลับบิล
  const switchOrder = (orderId: string) => {
    setCurrentOrderId(orderId);
  };

  // ลบบิล (ยกเว้นบิลปัจจุบัน)
  const deleteOrder = (orderId: string) => {
    // if (orderId === currentOrderId) {
    //   console.log("ไม่สามารถลบบิลที่กำลังใช้งานอยู่ได้");
    //   return;
    // }
    setOrders(orders.filter((order) => order.id !== orderId));
    if (orders.length === 1) {
      const newOrderId = uuidv4();
      setOrders([{ id: newOrderId, items: [] }]);
      setCurrentOrderId(newOrderId);
    } else if (currentOrderId === orderId) {
      setCurrentOrderId(orders[0].id); // สลับไปบิลแรกถ้าบิลปัจจุบันถูกลบ
    }
  };

  return (
    <div style={{ height: "100vh", overflow: "hidden" }}>
      <Row gutter={[10, 10]} style={{ height: "100%" }}>
        <Col span={16} style={{ height: "100%" }}>
          <ProductList
            newOrderList={currentOrder.items}
            setNewOrderList={(items) => {
              console.log("Received items in PosPage setNewOrderList:", items);
              const updatedItems = Array.isArray(items) ? items : [];
              setOrders(
                orders.map((order) =>
                  order.id === currentOrderId
                    ? { ...order, items: updatedItems }
                    : order
                )
              );
            }}
            stockData={stockData}
            loading={loading}
            filter={filter}
            setFilter={setFilter}
            branchInfo={branchInfo}
            categoryData={categoryData?.categorys?.data}
            triggerFocus={triggerFocus} // ส่ง triggerFocus ไปยัง ProductList

          />
        </Col>
        <Col span={8} style={{ height: "100%" }}>
          <OrderBillSection
            orders={orders}
            currentOrderId={currentOrderId}
            addNewOrderBill={addNewOrderBill}
            switchOrder={switchOrder}
            deleteOrder={deleteOrder}
          />
          <PosOrderList
            newOrderList={currentOrder.items}
            setNewOrderList={(items) => {
              const updatedItems = Array.isArray(items) ? items : [];
              setOrders(
                orders.map((order) =>
                  order.id === currentOrderId
                    ? { ...order, items: updatedItems }
                    : order
                )
              );
            }}
            setIsPayments={setIsPayments}
            exchange={exchange}
            discountData={discountData}
            setDiscountData={setDiscountData}
            totalFinal={totalFinal}
            stockData={stockData?.stocks?.data || []}
          />
        </Col>
      </Row>
      <PosPayement
        newOrderList={currentOrder.items}
        setNewOrderList={(items) => {
          console.log("Received items in PosPayement setNewOrderList:", items);
          const updatedItems = Array.isArray(items) ? items : [];
          setOrders(
            orders.map((order) =>
              order.id === currentOrderId
                ? { ...order, items: updatedItems }
                : order
            )
          );
        }}
        onOrderCompleted={handleOrderCompleted} // ส่ง callback ไปยัง PosPayment
        isPayments={isPayments}
        onClose={() => {
          // setOrders(orders.filter(order => order.id !== currentOrderId)); // ลบบิลที่ชำระแล้ว
          // if (orders.length === 1) {
          //   const newOrderId = uuidv4();
          //   setOrders([{ id: newOrderId, items: [] }]);
          //   setCurrentOrderId(newOrderId);
          // } else {
          //   setCurrentOrderId(orders[0].id); // สลับไปบิลแรก
          // }
          setIsPayments(false);
        }}
        setCurrentOrderId={setCurrentOrderId}
        discountData={discountData}
        totalFinal={totalFinal}
        exchange={exchange}
        setDiscountData={setDiscountData}
        reloadStock={reloadStock}
        reloadLastOrder={reloadLastOrder}
        lastOrder={lastOrder}
        currentOrderId={currentOrderId} // เพิ่ม currentOrderId
        setOrders={setOrders} // เพิ่ม setOrders
        orders={orders} // เพิ่ม orders
      />
    </div>
  );
};

export default PosPage;