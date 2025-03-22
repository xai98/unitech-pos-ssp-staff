import { Affix, Flex, message, Tag } from "antd";
import AppbarHeader from "../component/AppbarHeader";
import { useEffect, useState } from "react";
import { useLazyQuery, useQuery } from "@apollo/client";
import {
  CATEGORIES,
  GET_BRANCH_STOCKS,
  GET_EXCHANGE,
  GET_LAST_ORDER,
} from "../../../services";
import { context } from "../../../hooks/Context";
import FilterCategory from "./FilterCategory";
import { formatNumber, getUserDataFromLCStorage } from "../../../utils/helper";
import ProductMobile from "./ProductMobile";
import PaymentMobile from "./PaymentMobile";
import { consts } from "../../../utils";
import { useNavigate } from "react-router-dom";
import routes from "../../../utils/routes";
import * as _ from "lodash";

function PosMobilePage() {
  const {
    categoryData,
    setCategoryData,
    totalOrderPrice,
    // totalCart,
    totalOrder,
    setStockList,
    cart,
    setExchange,
  } = context();
  const branchInfo = getUserDataFromLCStorage();

  const navigate = useNavigate();

  const [isPayment, setIsPayment] = useState(false);

  const [filter, setFilter] = useState<any>({
    categoryId: "ALL",
    orderBy: "noShow_ASC",
  });

  const [loadCategory, { data: categorys }] = useLazyQuery(CATEGORIES, {
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

  const [loadExchnage, { data: exchangeData }] = useLazyQuery(GET_EXCHANGE, {
    fetchPolicy: "network-only",
    variables: {
      where: {
        id: consts.EXCHNAGE_ID,
      },
    },
  });

  const { data: lastOrder, refetch: reloadLastOrder } = useQuery(
    GET_LAST_ORDER,
    {
      fetchPolicy: "network-only",
      variables: {
        where: {
          branchId: branchInfo?.branchId?.id || undefined,
        },
      },
    }
  );



  useEffect(() => {
    // ตรวจสอบค่าใน localStorage
    const checkExchange = localStorage.getItem("VIXAY_POS");

    if (checkExchange) {
      try {
        // แปลงข้อมูลจาก localStorage กลับเป็น object
        const exchangeData = JSON.parse(checkExchange);
        if (exchangeData) {
          setExchange(exchangeData);
        }
      } catch (error) {
        console.error("Error parsing exchange data from localStorage:", error);
      }
    } else {
      // ถ้าไม่มีข้อมูล ให้โหลดใหม่
      loadExchnage();
    }
  }, []); // ✅ เรียกใช้แค่ตอน component mount

  useEffect(() => {
    // โหลด category ถ้ายังไม่มีข้อมูล
    if (_.isEmpty(categoryData)) {
      loadCategory();
    }
  }, [categoryData]);

  useEffect(() => {
    if (categorys?.categorys?.data?.length !== 0) {
      setCategoryData(categorys?.categorys?.data); // ✅ อัปเดต State เมื่อ `categorys` เปลี่ยน
    }
  }, [categorys]); // ✅ React จะอัปเดตข้อมูลเมื่อ `categorys` มีค่าใหม่

  useEffect(() => {
    if (stockData?.stocks?.data.length !== 0) {
      setStockList(stockData?.stocks?.data);
    }
  }, [stockData]);

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

  const handAlert = () => {
    message.warning("ກະລຸນາເລືອກລາຍການສິນຄ້າກ່ອນຊຳລະເງິນ");
  };

  const backHome = () => {
    navigate(routes.HOME_MOBILE, { replace: true });
  };

  return (
    <div>
      <Affix offsetTop={0}>
        <div style={{ backgroundColor: "#fff" }}>
          <AppbarHeader title="ໄລ່ເງິນ" onBack={backHome} />
          <div style={{ height: 10 }}></div>
          <div style={{ padding: 10 }}>
            <FilterCategory filter={filter} setFilter={setFilter} />
          </div>
        </div>
      </Affix>
      <div style={{ padding: 10 }}>
        <ProductMobile
          stockData={stockData}
          loading={loading}
          filter={filter}
          setFilter={setFilter}
          branchInfo={branchInfo}
        />
      </div>

      <div
        style={{
          backgroundColor: cart.length === 0 ? "red" : "#1976d2",
          position: "fixed",
          bottom: "0%",
          width: "100%",
          zIndex: "10",
        }}
      >
        <Flex justify="space-between" align="center">
          <div style={{ backgroundColor: "#000", width: "70%", padding: 10 }}>
            <div style={{ color: "white" }}>
              ຈ/ນເຄື່ອງ: <Tag color="orange">{totalOrder}</Tag> ໂຕ
            </div>
            <div style={{ color: "white", fontSize: 22 }}>
              ລວມເງິນ: {formatNumber(totalOrderPrice || 0)} ກີບ{" "}
            </div>
          </div>
          <div
            style={{
              width: "30%",
              padding: 10,
              color: "#fff",
              textAlign: "center",
            }}
            onClick={() =>
              cart.length === 0 ? handAlert() : setIsPayment(true)
            }
          >
            {cart.length === 0 ? "ເລືອກເຄື່ອງກ່ອນ" : "ຊຳລະເງິນ"}
          </div>
        </Flex>
      </div>

      <PaymentMobile
        open={isPayment}
        onClose={() => setIsPayment(false)}
        reloadStock={() => reloadStock()}
        reloadLastOrder={() => reloadLastOrder()}
        lastOrder={lastOrder}
      />
    </div>
  );
}

export default PosMobilePage;
