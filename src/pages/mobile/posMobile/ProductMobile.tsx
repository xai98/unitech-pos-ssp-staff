import React, { useState } from "react";
import { consts } from "../../../utils";
import { Button, Card, Drawer, InputNumber, message, Spin } from "antd";
import { formatNumber, textLength } from "../../../utils/helper";
import { context } from "../../../hooks/Context";

const defaultImage =
  "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";

interface ProductData {
  stockData: any;
  loading: boolean;
  filter: any;
  setFilter: (filter: any) => void;
  branchInfo: any;
}

const ProductMobile: React.FC<ProductData> = ({
  stockData,
  loading,
  filter,
}) => {
  const [productDetail, setProductDetail] = useState({
    open: false,
    data: null,
  });

  const filteredProducts = stockData?.stocks?.data?.filter((product: any) => {
    // ถ้าไม่มีการกรองตาม productName และ categoryId เป็น "ALL" ให้แสดงผลทั้งหมด
    if (!filter.productName && filter.categoryId === "ALL") return true;

    // ถ้า categoryId เป็น "ALL" แสดงผลตามการกรอง productName
    if (filter.categoryId === "ALL") {
      return filter.productName
        ? product.productName
            .toLowerCase()
            .includes(filter.productName.toLowerCase())
        : true;
    }

    // ถ้า filter.categoryId ไม่ใช่ "ALL" ให้กรองตาม categoryId และ productName
    const matchesCategory =
      filter.categoryId === undefined ||
      product.categoryId?.id === filter.categoryId;

    const matchesProductName =
      filter.productName === undefined ||
      product.productName
        .toLowerCase()
        .includes(filter.productName.toLowerCase());

    return matchesCategory && matchesProductName;
  });
  return (
    <div>
      <Spin size="large" spinning={loading} tip="ກຳລັງໂຫລດຂໍ້ມູນ...">
        <Card
          style={{
            padding: 0,
            border: 0,
            marginTop: 10,
            marginBottom: 100,
            background: "#F5F5F5",
          }}
        >
          {filteredProducts?.map((item: any) => (
            <Card.Grid
              key={item.productId.id}
              style={{
                width: "33.33%",
                padding: 5,
                position: "relative",
                cursor: "pointer",
              }}
              onClick={() => setProductDetail({ open: true, data: item })}
            >
              <Card
                style={{ borderRadius: 0 }}
                cover={
                  <img
                    alt="product"
                    src={
                      item.productId.image
                        ? consts.URL_PHOTO_AW3 + item.productId.image
                        : defaultImage
                    }
                    style={{ height: 100, objectFit: "cover" }}
                  />
                }
              >
                <div
                  style={{
                    position: "absolute",
                    top: "0%",
                    right: "0%",
                    padding: "3px 10px",
                    backgroundColor: "#1976d2",
                    borderRadius: 2,
                    color: "#fff",
                    fontSize: "10px",
                  }}
                >
                  {item.amount}
                </div>
                <div style={{ padding: 10, height: "auto" }}>
                  <div style={{ fontSize: 14, color: "gray" }}>
                    {textLength(item?.productName, 17)}
                  </div>
                  <div style={{ fontSize: 12 }}>
                    {formatNumber(item?.productId.price_sale)} ກີບ
                  </div>
                </div>
              </Card>
            </Card.Grid>
          ))}
        </Card>
      </Spin>

      <ProductAddCart
        open={productDetail.open}
        onClose={() => setProductDetail({ open: false, data: null })}
        data={productDetail.data}
      />
    </div>
  );
};

interface ProductProps {
  open: boolean;
  onClose: () => void;
  data: any;
}

const ProductAddCart: React.FC<ProductProps> = ({ open, onClose, data }) => {

 const {cart, setCart } = context();
  const [qty, setQty] = useState<number>(1)

  const handleAddCart = () => {
   
    const existingItem = cart.find(
        (item) => item.productId === data?.productId?.id
      );
  
      if (data.amount <= 0) {
        return message.warning("ສິນຄ້າບໍ່ພຽງພໍ");
      }
  
      if (existingItem) {
        if (existingItem.order_qty >= data.amount) {
          return message.warning("ສິນຄ້າບໍ່ພຽງພໍ");
        }
  
        const updatedList = cart.map((item) =>
          item.productId === data?.productId?.id
            ? {
                ...item,
                order_qty: item.order_qty + qty,
                order_total_price: item.order_total_price + (item?.price_sale * qty),
                commission: data?.commissionStatus
                  ? item.commission + (data?.commission * qty)
                  : 0,
              }
            : item
        );
  
        setCart(updatedList);
        message.success("ເພີ່ມອໍເດີ້ສຳເລັດ");
        setQty(1);
        onClose();

      } else {
        const newOrder = {
          productId: data?.productId?.id,
          productName: data?.productName,
          price_cost: data?.productId?.price_cost ?? 0,
          price_sale: data?.productId?.price_sale ?? 0,
          order_qty: qty,
          commission: data?.commissionStatus ? data?.commission * qty : 0,
          order_total_price: data?.productId?.price_sale * qty,
        }; 
  
        setCart([newOrder, ...cart]);
        message.success("ເພີ່ມອໍເດີ້ສຳເລັດ");
        setQty(1);
        onClose();
      }
  };


  return (
    <Drawer
      title={data?.productName}
      placement={"bottom"}
      closable={false}
      onClose={onClose}
      open={open}
      key={"bottom"}
      style={{ zIndex: 9999 }}
      height={450}
    >
      <img
        alt="product"
        src={
          data?.productId?.image
            ? consts.URL_PHOTO_AW3 + data?.productId?.image
            : defaultImage
        }
        style={{ height: 200, width: "100%", objectFit: "cover" }}
      />

      <div style={{ height: 10 }}></div>
      <span style={{ color: "gray" }}>ປ້ອນຈຳນວນ</span>
      <InputNumber
        size="large"
        autoComplete="off"
        min={1}
        defaultValue={1}
        value={qty}
        style={{
          width: "100%",
        }}
        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        parser={(value) => (value ? parseFloat(value.replace(/(,*)/g, "")) : 0)}
        onChange={(value) => setQty(value || 1)}
      />

      {/* ปุ่ม */}
      <div
        style={{
          position: "absolute",
          bottom: "5%",
          left: 0,
          width: "100%", // ✅ ทำให้ div ครอบปุ่มเต็มพื้นที่
          padding: "0 16px", // ✅ เพิ่ม Padding ให้ไม่ชิดขอบเกินไป
        }}
      >
        <Button
          size="large"
          style={{
            width: "100%", // ✅ ทำให้ปุ่มเต็ม 100%
            backgroundColor: "#005eb7",
            borderColor: "#005eb7",
            color: "#fff",
          }}

          onClick={handleAddCart}
        >
          ເພີ່ມເຂົ້າກະຕ່າ
        </Button>
      </div>
    </Drawer>
  );
};

export default ProductMobile;
