import { Col, Row } from "antd";
import { useEffect, useState, useMemo, useCallback } from "react";
import ProductList from "./ProductList";
import ChangeOrderList from "./ChangeOrderList";
import PosPayementChange from "./PosPaymentChange";
import { useParams } from "react-router-dom";
import { useQuery, useLazyQuery } from "@apollo/client";
import { CATEGORIES, GET_BRANCH_STOCKS, GET_EXCHANGE, GET_ORDER_ONE } from "../../services";
import { consts } from "../../utils";
import { getUserDataFromLCStorage } from "../../utils/helper";

interface ExchangeRate {
  bath: number;
  usd: number;
  cny: number;
}

interface TotalAmount {
  lak: number;
  bath: number;
  usd: number;
}

const ChangeProduct = () => {
  const { orderId } = useParams();
  const branchInfo = useMemo(() => getUserDataFromLCStorage(), []);
  const [filter, setFilter] = useState({
    categoryId: "ALL",
    productName: '',
    orderBy: "noShow_ASC",
  });
  
  const [newOrderList, setNewOrderList] = useState<any[]>([]);
  const [oldOrderList, setOldOrderList] = useState<any[]>([]);
  const [beforeOrderList, setBeforeOrderList] = useState<any[]>([]);
  const [changeOrderList, setChangeOrderList] = useState<any[]>([]);
  const [isPayments, setIsPayments] = useState(false);
  const [typeDiscount, setTypeDiscount] = useState("");
  const [discount, setDiscount] = useState(0);
  const [totalFinal, setTotalFinal] = useState<TotalAmount>({
    lak: 0,
    bath: 0,
    usd: 0,
  });
  const [exchange, setExchange] = useState<ExchangeRate>({
    bath: 0,
    usd: 0,
    cny: 0,
  });

  const [loadExchange, { data: exchangeData }] = useLazyQuery(GET_EXCHANGE, {
    fetchPolicy: "network-only",
    variables: { where: { id: consts.EXCHNAGE_ID } },
  });

  const [loadOrder, { data: orderData }] = useLazyQuery(GET_ORDER_ONE, {
    variables: { where: { id: orderId } },
  });

  const { data: categoryData } = useQuery(CATEGORIES, {
    fetchPolicy: "network-only",
  });

  const { loading, data: stockData } = useQuery(GET_BRANCH_STOCKS, {
    fetchPolicy: "network-only",
    variables: {
      where: {
        branchId: branchInfo?.branchId?.id,
        isShowSale: true,
      },
      orderBy: filter.orderBy,
    },
    skip: !branchInfo?.branchId?.id,
  });

  const initializeExchangeRate = useCallback(() => {
    const storedData = localStorage.getItem("VIXAY_POS");
    if (storedData) {
      setExchange(JSON.parse(storedData));
    } else {
      loadExchange();
    }
  }, [loadExchange]);

  const processOrderData = useCallback(() => {
    if (!orderData?.order?.order_items) return;

    
    const orderItems = orderData?.order?.order_items?.map((item: any) => ({
      productId: item.productId.id,
      productName: item.productName,
      price_cost: item.productId.price_cost,
      price_sale: item.productId.price_sale,
      order_qty: item.order_qty,
      commission: item.commissionStatus ? item.product?.commission : 0,
      order_total_price: item.order_total_price,
    }));

    
    setBeforeOrderList(orderItems);
    setOldOrderList(orderItems);
  }, [orderData]);


  const updateLocalStorageExchange = useCallback(() => {
    if (exchangeData?.exchangeRate) {
      const { bath, usd, cny } = exchangeData.exchangeRate;
      const exchangeRateData = { bath, usd, cny };
      localStorage.setItem("VIXAY_POS", JSON.stringify(exchangeRateData));
      setExchange(exchangeRateData);
    }
  }, [exchangeData]);

  useEffect(() => {
    initializeExchangeRate();
  }, [initializeExchangeRate]);

  useEffect(() => {
    if (orderId) loadOrder();
  }, [orderId, loadOrder]);

  useEffect(() => {
    processOrderData();
  }, [processOrderData]);

  useEffect(() => {
    updateLocalStorageExchange();
  }, [updateLocalStorageExchange]);

  const stockItems = stockData?.stocks?.data || [];

  return (
    <div>
      <Row gutter={12}>
        <Col span={12}>
          <ProductList
            newOrderList={newOrderList}
            setNewOrderList={setNewOrderList}
            stockData={stockData}
            loading={loading}
            filter={filter}
            setFilter={setFilter}
            branchInfo={branchInfo}
            categoryData={categoryData?.categorys?.data}
          />
        </Col>
        <Col span={12}>
          <ChangeOrderList
            newOrderList={newOrderList}
            setNewOrderList={setNewOrderList}
            setIsPayments={setIsPayments}
            exchange={exchange}
            typeDiscount={typeDiscount}
            setTypeDiscount={setTypeDiscount}
            discount={discount}
            setDiscount={setDiscount}
            totalFinal={totalFinal}
            setTotalFinal={setTotalFinal}
            oldOrderList={oldOrderList}
            setOldOrderList={setOldOrderList}
            changeOrderList={changeOrderList}
            setChangeOrderList={setChangeOrderList}
            stockData={stockItems}
          />
        </Col>
      </Row>

      <PosPayementChange
        orderId={orderData?.order?.id}
        order_no={orderData?.order?.order_no}
        newOrderList={newOrderList}
        changeOrderList={changeOrderList}
        beforeOrderList={beforeOrderList}
        isPayments={isPayments}
        onClose={() => setIsPayments(false)}
        exchange={exchange}
      />
    </div>
  );
};

export default ChangeProduct;