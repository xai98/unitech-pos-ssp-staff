import { Button, Flex, InputNumber, Select, Space } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useMemo } from "react";
import { formatNumber } from "../../utils/helper";

interface PosOrderListProps {
  newOrderList: any[];
  exchange: any;
  setNewOrderList: (newOrderList: any[]) => void;
  setIsPayments: (isPayments: boolean) => void;
  discountData: { type: string; value: number };
  setDiscountData: (discountData: { type: string; value: number }) => void;
  totalFinal: { lak: number; bath: number; usd: number };
  stockData: any[];
}

const PosOrderList: React.FC<PosOrderListProps> = ({
  newOrderList,
  setNewOrderList,
  setIsPayments,
  discountData,
  setDiscountData,
  totalFinal,
  stockData,
}) => {
  // Memoize subtotal calculation
  const subtotal = useMemo(() => {
    return newOrderList.reduce((acc, item) => acc + (item.order_total_price || 0), 0);
  }, [newOrderList]);

  // Handle quantity change
  const handleQtyChange = (value: number | null, order: any) => {
    if (!value || value < 1) return;
    const product = stockData.find((pro) => pro.productId?.id === order.productId);
    if (value > product.amount) return;

    setNewOrderList(
      newOrderList.map((item) =>
        item.productId === order.productId
          ? {
              ...item,
              order_qty: value,
              order_total_price: order.price_sale * value,
              commission: product?.commissionStatus ? product.commission * value : 0,
            }
          : item
      )
    );
  };

  // Handle discount change
  const handleDiscountChange = (value: number | null) => {
    if (value === null || value < 0) return;
    const maxDiscount = discountData.type === "PERCENT" ? 100 : subtotal;
    setDiscountData({ ...discountData, value: Math.min(value, maxDiscount) });
  };

  // Remove item
  const removeOrder = (productId: string) => {
    setNewOrderList(newOrderList.filter((item) => item.productId !== productId));
  };

  // Clear all orders
  const clearOrders = () => {
    setNewOrderList([]);
    setDiscountData({ type: "", value: 0 });
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#fff", borderRadius: 8 }}>
      {/* Header */}
      <Flex style={{ padding: "10px 10px 0", flexShrink: 0 }} gap={10}>
        <h3 style={{ margin: 0 }}>ລາຍການສັ່ງຊື້ :</h3>
        <span style={{ fontSize: 16, color: "#1976d2",fontWeight:"bold" }}>{formatNumber(subtotal)} ກີບ</span>
      </Flex>

      {/* Order List (Scrollable) */}
      <div
        style={{
          flex: 1,
          maxHeight: "550px",
          overflowY: "auto",
          padding: "10px 10px 50px 10px",
          border:'0.1px solid #eee',
          borderRadius:"10px"
        }}
      >
        {newOrderList.length === 0 ? (
          <div style={{ textAlign: "center", padding: 20, color: "#888" }}>
          ຍັງບໍ່ມີລາຍການສິນຄ້າ
          </div>
        ) : (
          newOrderList.map((item, index) => (
            <div
              key={item.productId}
              style={{
                padding: "10px 10px",
                borderBottom: "1px solid #eee",
                background: index === 0 ? "#f0f9ff" : "transparent",
              }}
            >
              <Flex justify="space-between" align="center">
                <span>{item.productName}</span>
                <Space>
                  <InputNumber
                    min={1}
                    max={stockData.find((p) => p.productId.id === item.productId)?.amount}
                    value={item.order_qty}
                    onChange={(value) => handleQtyChange(value, item)}
                    size="small"
                    style={{ width: 60 }}
                  />
                  <span>x {formatNumber(item.price_sale)}</span>
                </Space>
              </Flex>
              <Flex justify="space-between" align="center" style={{ marginTop: 5 }}>
                <span style={{ color: "#888" }}>{formatNumber(item.order_total_price)} ກີບ</span>
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() => removeOrder(item.productId)}
                />
              </Flex>
            </div>
          ))
        )}
      </div>

      {/* Fixed Footer (Discount, Total, Actions) */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          background: "#fff",
          padding: 10,
          // borderTop: "1px solid #eee",
          zIndex: 1,
        }}
      >
        {/* Discount Section */}
        <Space direction="vertical" size="small" style={{ width: "100%", marginBottom: 10 }}>
          <Flex justify="space-between">
            <Select
              value={discountData.type}
              onChange={(value) => setDiscountData({ ...discountData, type: value })}
              placeholder="ສ່ວນຫຼຸດ"
              style={{ width: 120 }}
              options={[
                { value: "", label: "ບໍ່ມີສ່ວນຫຼຸດ" },
                { value: "PERCENT", label: "ເປີເຊັນ" },
                { value: "AMOUNT", label: "ຈຳນວນເງິນ" },
              ]}
            />
            {discountData.type && (
              <InputNumber
                min={0}
                value={discountData.value}
                onChange={handleDiscountChange}
                placeholder={discountData.type === "PERCENT" ? "0-100" : "จำนวน"}
                addonAfter={discountData.type === "PERCENT" ? "%" : "ກີບ"}
                style={{ width: 120 }}
              />
            )}
          </Flex>
        </Space>

        {/* Total Section */}
        <div style={{ padding: "0 0 10px" }}>
          <Flex justify="space-between" style={{ fontWeight: "bold", marginBottom: 5 }}>
            <span>ຍອດຊຳລະຈິງ</span>
            <span>{formatNumber(totalFinal.lak)} ກີບ</span>
          </Flex>
          <Flex justify="space-between" style={{ color: "#888" }}>
            <span>ບາດ</span>
            <span>{formatNumber(totalFinal.bath)}</span>
          </Flex>
          {/* <Flex justify="space-between" style={{ color: "#888" }}>
            <span>ໂດລາ</span>
            <span>{formatNumber(totalFinal.usd)}</span>
          </Flex> */}
        </div>

        {/* Actions */}
        <Space direction="vertical" style={{ width: "100%" }}>
          <Button
            type="primary"
            size="large"
            block
            disabled={!newOrderList.length}
            onClick={() => setIsPayments(true)}
            style={{ background: "#1976d2" }}
          >
            ຊຳລະເງິນ
          </Button>
          <Button block onClick={clearOrders} disabled={!newOrderList.length}>
            ຍົກເລິກທັງໝົດ
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default PosOrderList;