import { Card, Col, Input, Row, Spin } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useState, useMemo, useCallback, memo, useRef, useEffect } from "react";
import { formatNumber } from "../../utils/helper";
import { consts } from "../../utils";
import type { InputRef } from "antd"; // Import InputRef type จาก Ant Design
import { LazyLoadImage } from "react-lazy-load-image-component"; // เพิ่ม dependency นี้
import "react-lazy-load-image-component/src/effects/blur.css"; // เพิ่ม effect ถ้าต้องการ
import styled from "styled-components";

const ProductImage = styled(LazyLoadImage)`
  border-radius: 8px;
  object-fit: cover;
  width: 100%;
`;

const CardDescription = styled.div`
padding:0px 10px 5px 10px;
`

const ProductName = styled.div`
font-size:12px;
font-weight:400;
color:gray;
`


const defaultImage =
  "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";

interface OrderItem {
  productId: string;
  productName: string;
  price_cost: number;
  price_sale: number;
  order_qty: number;
  commission: number;
  order_total_price: number;
}

interface ProductData {
  newOrderList: OrderItem[];
  setNewOrderList: React.Dispatch<React.SetStateAction<OrderItem[]>>;
  stockData: any;
  loading: boolean;
  filter: { categoryId: string; productName: string };
  setFilter: (filter: any) => void;
  branchInfo: any;
  categoryData: any;
  triggerFocus?: boolean;
}

const ProductList: React.FC<ProductData> = memo(
  ({
    newOrderList,
    setNewOrderList,
    stockData,
    loading,
    filter,
    setFilter,
    categoryData,
    triggerFocus,
  }) => {
    const [barcodeInput, setBarcodeInput] = useState("");
    const barcodeInputRef = useRef<InputRef>(null);
    // Barcode Index - Cache ด้วย useMemo
    const barcodeMap = useMemo(() => {
      const map = new Map<string, any>();
      stockData?.stocks?.data?.forEach((product: any) => {
        if (product.isShowSale) {
          const barcode = product.barcode || product.productId?.barcode;
          if (barcode) map.set(barcode, product);
        }
      });
      return map;
    }, [stockData?.stocks?.data]);

    // เมื่อ triggerFocus เปลี่ยนแปลง ให้ focus ที่ input
    useEffect(() => {
      if (triggerFocus && barcodeInputRef.current) {
        barcodeInputRef.current.focus();
      }
    }, [triggerFocus]);

    // Optimize addNewOrder
    const addNewOrder = useCallback(
      (product: any) => {
        if (product.amount <= 0) return;

        // console.log("Current newOrderList before update:", newOrderList); // เพิ่มล็อกเพื่อตรวจสอบ
        const updatedList = [
          ...(Array.isArray(newOrderList) ? newOrderList : []),
        ];
        const existingItemIndex = updatedList.findIndex(
          (item) => item.productId === product?.productId?.id
        );
        if (existingItemIndex !== -1) {
          const existingItem = updatedList[existingItemIndex];
          if (existingItem.order_qty >= product.amount) return;
          const updatedItem = {
            ...existingItem,
            order_qty: existingItem.order_qty + 1,
            order_total_price:
              existingItem.order_total_price + existingItem.price_sale,
            commission: product?.commissionStatus
              ? existingItem.commission + product?.commission
              : 0,
          };
          // console.log("Updating existing item:", updatedItem); // เพิ่มล็อกเพื่อตรวจสอบ
          updatedList[existingItemIndex] = updatedItem;
        } else {
          const newItem = {
            productId: product?.productId?.id,
            productName: product?.productName,
            price_cost: product?.productId?.price_cost ?? 0,
            price_sale: product?.productId?.price_sale ?? 0,
            order_qty: 1,
            commission: product?.commissionStatus ? product?.commission : 0,
            order_total_price: product?.productId?.price_sale,
          };
          // console.log("Adding new item:", newItem); // เพิ่มล็อกเพื่อตรวจสอบ
          updatedList.unshift(newItem); // เพิ่มสินค้าขึ้นหน้าสุด
        }
        setNewOrderList(updatedList);
      },
      [setNewOrderList]
    );

    // Handle barcode input change
    const handleBarcodeChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        if (/^[a-zA-Z0-9]*$/.test(value)) {
          setBarcodeInput(value);
        }
      },
      []
    );

    // Handle barcode search and add on Enter
    const handleBarcodeKeyPress = useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== "Enter" || !barcodeInput) return;
        const formattedBarcode =
          barcodeInput.length === 12 ? "0" + barcodeInput : barcodeInput;
        const foundProduct = barcodeMap.get(formattedBarcode);
        if (foundProduct) {
          addNewOrder(foundProduct);
          setBarcodeInput("");
        } else {
          console.log("ບໍ່ເຫັນສິນຄ້າສຳທີ່ສະແກນ");
        }
      },
      [barcodeInput, barcodeMap, addNewOrder]
    );

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setFilter((prev: any) => ({ ...prev, productName: event.target.value }));
    };

    // Memoize filtered products
    const filteredProducts = useMemo(() => {
      if (!stockData?.stocks?.data) return [];
      const lowerCaseFilter = filter?.productName?.toLowerCase();
      return stockData.stocks.data.filter((product: any) => {
        const matchesCategory =
          filter.categoryId === "ALL" ||
          product.categoryId?.id === filter.categoryId;
        const matchesName =
          !filter.productName ||
          product.productName.toLowerCase().includes(lowerCaseFilter);
        return matchesCategory && matchesName;
      });
    }, [stockData?.stocks?.data, filter.categoryId, filter.productName]);

    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#fff",
          borderRadius: 8,
        }}
      >
        <div
          style={{ flexShrink: 0, padding: 10, borderBottom: "1px solid #eee" }}
        >
          <Row gutter={8}>
            <Col span={12}>
              <Input
                size="large"
                placeholder="ຄົ້ນຫາສິນຄ້າ"
                onChange={handleSearchChange}
                prefix={<SearchOutlined />}
                style={{ marginBottom: 10 }}
                allowClear
              />
            </Col>
            <Col span={12}>
              <Input
                ref={barcodeInputRef}
                size="large"
                placeholder="ສະແກນບາໂຄ้ດ"
                value={barcodeInput}
                onChange={handleBarcodeChange}
                onPressEnter={handleBarcodeKeyPress}
                autoFocus
                style={{ marginBottom: 10 }}
                allowClear
              />
            </Col>
          </Row>

          <div
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              whiteSpace: "nowrap",
              paddingBottom: 5,
            }}
          >
            <button
              onClick={() => setFilter({ ...filter, categoryId: "ALL" })}
              style={{
                padding: "6px 12px",
                borderRadius: 16,
                border: "1px solid #d9d9d9",
                background: filter.categoryId === "ALL" ? "#1976d2" : "white",
                color: filter.categoryId === "ALL" ? "white" : "black",
                cursor: "pointer",
                fontSize: 14,
                transition: "all 0.3s",
              }}
            >
              ທັງໝົດ
            </button>
            {categoryData?.map((item: any) => (
              <button
                key={item.id}
                onClick={() => setFilter({ ...filter, categoryId: item.id })}
                style={{
                  padding: "6px 12px",
                  borderRadius: 16,
                  border: "1px solid #d9d9d9",
                  background:
                    filter.categoryId === item.id ? "#1976d2" : "white",
                  color: filter.categoryId === item.id ? "white" : "black",
                  cursor: "pointer",
                  fontSize: 14,
                  transition: "all 0.3s",
                }}
              >
                {item.categoryName}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, padding: 10, overflowY: "auto" }}>
          <Spin spinning={loading}>
            {filteredProducts.length === 0 ? (
              <div style={{ textAlign: "center", padding: 20, color: "#888" }}>
                ບໍ່ມີສິນຄ້າ
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                  gap: 10,
                }}
                className="card-pos"
              >
                {filteredProducts.map((item: any) => (
                  <Card
                    key={item.productId.id}
                    hoverable
                    onClick={() => addNewOrder(item)}
                    cover={
                      <ProductImage
                        src={
                          item.productId.image
                            ? consts.URL_PHOTO_AW3 + item.productId.image
                            : defaultImage
                        }
                        alt={item?.productId?.productName}
                        height={100}
                        placeholder={
                          <div
                            style={{
                              width: 100,
                              height: 100,
                              background: "#f0f0f0",
                            }}
                          />
                        }
                        effect="blur" // Optional: เพิ่ม effect ขณะโหลด
                      />
                    }
                    style={{ borderRadius: 8, overflow: "hidden" }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 5,
                        right: 5,
                        background: item.amount > 0 ? "#1976d2" : "#ff4d4f",
                        color: "white",
                        padding: "2px 8px",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    >
                      {item.amount}
                    </div>
                    <CardDescription>
                      <ProductName>{item.productName}</ProductName>
                      <div>
                        {`${formatNumber(item.productId.price_sale)} ກີບ`}
                      </div>
                    </CardDescription>
                  </Card>
                ))}
              </div>
            )}
          </Spin>
        </div>
      </div>
    );
  }
);

export default ProductList;
