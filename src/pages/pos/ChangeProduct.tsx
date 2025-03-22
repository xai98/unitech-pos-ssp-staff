import { Col, Row } from "antd";
import { useEffect, useState } from "react";
import ProductList from "./ProductList";
import {
  CATEGORIES,
  GET_BRANCH_STOCKS,
  GET_EXCHANGE,
  GET_ORDER_ONE,
} from "../../services";
import { useLazyQuery, useQuery } from "@apollo/client";
import { consts } from "../../utils";
import { getUserDataFromLCStorage } from "../../utils/helper";
import ChangeOrderList from "./ChangeOrderList";
import { useParams } from "react-router-dom";
import PosPayementChange from "./PosPaymentChange";

function ChangeProduct() {
  const { orderId } = useParams();

  const branchInfo = getUserDataFromLCStorage();
  const [filter, setFilter] = useState<any>({
    categoryId: "ALL",
    orderBy: "noShow_ASC",
  });
  const [newOrderList, setNewOrderList] = useState<any>([]);
  const [oldOrderList, setOldOrderList] = useState<any>([]);
  const [beforeOrderList, setBeforeOrderList] = useState<any>([]);
  const [changeOrderList, setChangeOrderList] = useState<any>([]);
  const [isPayments, setIsPayments] = useState<boolean>(false);
  const [typeDiscount, setTypeDiscount] = useState<string>("");
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

  const [exchange, setExchange] = useState<{
    bath: number;
    usd: number;
    cny: number;
  }>({
    bath: 0,
    usd: 0,
    cny: 0,
  });

  const [loadExchnage, { data: exchangeData }] = useLazyQuery(GET_EXCHANGE, {
    fetchPolicy: "network-only",
    variables: {
      where: {
        id: consts.EXCHNAGE_ID,
      },
    },
  });

  const [loadOrder, { data: orderData }] =
    useLazyQuery(GET_ORDER_ONE);

  const { data: categoryData } = useQuery(CATEGORIES, {
    fetchPolicy: "network-only",
  });

  const {
    loading,
    data: stockData,
    refetch: reloadStock,
  } = useQuery(GET_BRANCH_STOCKS, {
    fetchPolicy: "network-only",
    variables: {
      where: {
        branchId: branchInfo?.branchId?.id || undefined,
        isShowSale: true,
      },
      // limit: 300,
      orderBy: filter?.orderBy,
    },
  });

  useEffect(() => {
    const checkExchange = localStorage.getItem("VIXAY_POS");

    if (checkExchange) {
      // แปลงข้อมูลที่ได้จาก localStorage จาก string กลับเป็น object
      const exchangeData = JSON.parse(checkExchange);

      // ตั้งค่า exchange โดยใช้ข้อมูลจาก localStorage
      setExchange(exchangeData);
    } else {
      // ถ้าไม่มีข้อมูลใน localStorage จะโหลดข้อมูลใหม่
      loadExchnage();
    }
  }, []);

  useEffect(() => {
    if (orderId) {
      loadOrder({ variables: { where: { id: orderId } } });
    }
  }, [orderId]);

  useEffect(() => {
    if (orderData?.order) {
      const _orderItems = orderData?.order?.order_items?.map((item: any) => ({
        productId: item?.productId?.id,
        productName: item?.productName,
        price_cost: item?.productId?.price_cost,
        price_sale: item?.productId?.price_sale,
        order_qty: item?.order_qty,
        commission: item?.commissionStatus ? item?.product?.commission : 0,
        order_total_price: item?.productId?.price_sale,
      }));
      setBeforeOrderList(_orderItems)
      setOldOrderList(_orderItems);
    }
  }, [orderData?.order]);

  useEffect(() => {
    if (exchangeData?.exchangeRate) {
      const { bath, usd, cny } = exchangeData.exchangeRate;
      // สร้างออบเจ็กต์ที่จะบันทึกลงใน localStorage
      const exchangeRateData = {
        bath,
        usd,
        cny,
      };
      // บันทึกข้อมูลลงใน localStorage (ต้องแปลงออบเจ็กต์เป็น string ด้วย JSON.stringify)
      localStorage.setItem("VIXAY_POS", JSON.stringify(exchangeRateData));
    }
  }, [exchangeData?.exchangeRate]);

  return (
    <div>
      <Row gutter={12}>
        <Col span={12}>
          {/* ລາຍການສິນຄ້າ */}
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
          {/* ລາຍການສັ່ງຊື້ */}
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
            stockData={stockData?.stocks?.data || []}
          />
        </Col>
      </Row>

      {/* ຊຳລະເງິນ */}
      <PosPayementChange
        orderId={orderData?.order?.id}
        order_no={orderData?.order?.order_no}
        newOrderList={newOrderList}
        setNewOrderList={setNewOrderList}
        oldOrderList={oldOrderList}
        setOldOrderList={setOldOrderList}
        changeOrderList={changeOrderList}
        setChangeOrderList={setChangeOrderList}
        beforeOrderList={beforeOrderList}
        isPayments={isPayments}
        onClose={() => setIsPayments(false)}
        typeDiscount={typeDiscount}
        discount={discount}
        totalFinal={totalFinal}
        exchange={exchange}
        setDiscount={setDiscount}
        setTotalFinal={setTotalFinal}
        setTypeDiscount={setTypeDiscount}
        reloadStock={() => reloadStock()}
      />
    </div>
  );
}

export default ChangeProduct;
