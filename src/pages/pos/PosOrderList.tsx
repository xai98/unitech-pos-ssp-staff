import React, { useMemo } from "react";
import {
  Button,
  Flex,
  InputNumber,
  Select,
  Badge,
  Divider,
  Typography,
  Empty,
  Tooltip,
} from "antd";
import {
  DeleteOutlined,
  ShoppingCartOutlined,
  ClearOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import styled from "styled-components";
import { formatNumber } from "../../utils/helper";

const { Text } = Typography;

// Styled Components
const OrderContainer = styled.div`
  height: 90vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const Header = styled.div`
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px 12px 0 0;
  border-bottom: 1px solid #f0f0f0;
`;

const ScrollableContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  scrollbar-width: thin;
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #d9d9d9;
    border-radius: 3px;
  }
`;

const OrderItem = styled.div<{ isHighlighted: boolean }>`
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  background: ${(props) => (props.isHighlighted ? "#e6f7ff" : "#fafafa")};
  transition: all 0.3s;

  &:hover {
    background: #e6f7ff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
`;

const Footer = styled.div`
  padding: 16px;
  background: #f8f9fa;
  border-top: 1px solid #f0f0f0;
  border-radius: 0 0 12px 12px;
`;

const TotalPrice = styled(Text)`
  font-size: 18px;
  font-weight: bold;
`;

const PaymentButton = styled(Button)`
  height: 48px;
  font-size: 16px;
  font-weight: 500;
`;

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
    return newOrderList.reduce(
      (acc, item) => acc + (item.order_total_price || 0),
      0
    );
  }, [newOrderList]);

  // Handle quantity change
  const handleQtyChange = (value: number | null, order: any) => {
    if (!value || value < 1) return;
    const product = stockData.find(
      (pro) => pro.productId?.id === order.productId
    );
    if (value > product.amount) return;

    setNewOrderList(
      newOrderList.map((item) =>
        item.productId === order.productId
          ? {
              ...item,
              order_qty: value,
              order_total_price: order.price_sale * value,
              commission: product?.commissionStatus
                ? product.commission * value
                : 0,
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
    setNewOrderList(
      newOrderList.filter((item) => item.productId !== productId)
    );
  };

  // Clear all orders
  const clearOrders = () => {
    setNewOrderList([]);
    setDiscountData({ type: "", value: 0 });
  };

  return (
    <OrderContainer>
      {/* Header */}
      <Header>
        <Flex justify="space-between" align="center">
          <Flex align="center" gap={8}>
            <ShoppingCartOutlined style={{ fontSize: 20, color: "#1976d2" }} />
            {/* <Title level={4} style={{ margin: 0 }}>
              ລາຍການສັ່ງຊື້
            </Title> */}
            <TotalPrice type="success">ຍອດຊຳລະຈິງ: {formatNumber(totalFinal.lak)} ກີບ</TotalPrice>
          </Flex>
          <Badge count={newOrderList.length} showZero>
            <Button
              icon={<ClearOutlined />}
              onClick={clearOrders}
              disabled={!newOrderList.length}
              type="text"
            >
              ຍົກເລິກທັງໝົດ
            </Button>
          </Badge>
        </Flex>
      </Header>

      {/* Scrollable Order List */}
      <ScrollableContent>
        {newOrderList.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="ຍັງບໍ່ມີລາຍການສິນຄ້າ"
            style={{ margin: "40px 0" }}
          />
        ) : (
          newOrderList.map((item, index) => {
            const stock = stockData.find(
              (p) => p.productId.id === item.productId
            );
            const stockWarning = stock && stock.amount <= 5;

            return (
              <OrderItem key={item.productId} isHighlighted={index === 0}>
                <Flex justify="space-between" align="center">
                  <Flex vertical>
                    <Text strong>{item.productName}</Text>
                  </Flex>
                  <Flex justify="flex-end" style={{ marginTop: 4 }}>
                    <Text type="secondary">
                      ລວມ:{" "}
                      <Text strong style={{ color: "#1976d2" }}>
                        {formatNumber(item.order_total_price)} ກີບ
                      </Text>
                    </Text>
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      danger
                      onClick={() => removeOrder(item.productId)}
                      size="small"
                    />
                  </Flex>
                </Flex>
                <Flex align="center" gap={8}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {formatNumber(item.price_sale)} ກີບ
                    {stockWarning && (
                      <Tooltip title="ເຫຼືອໃນສາງໜ້ອຍ">
                        <Badge status="warning" style={{ marginLeft: 8 }} />
                      </Tooltip>
                    )}
                  </Text>
                  <InputNumber
                    min={1}
                    max={stock?.amount}
                    value={item.order_qty}
                    onChange={(value) => handleQtyChange(value, item)}
                    size="small"
                    style={{ width: 60 }}
                    controls={{ upIcon: "+", downIcon: "-" }}
                  />
                </Flex>
              </OrderItem>
            );
          })
        )}
      </ScrollableContent>

      {/* Sticky Footer */}
      <Footer>
        {/* Discount Section */}
        <Flex
          justify="space-between"
          align="center"
          style={{ marginBottom: 12 }}
        >
          <Text>ສ່ວນຫຼຸດ:</Text>
          <Flex gap={8}>
            <Select
              value={discountData.type}
              onChange={(value) =>
                setDiscountData({ ...discountData, type: value, value: 0 })
              }
              placeholder="ເລືອກປະເພດ"
              style={{ width: 120 }}
              options={[
                { value: "", label: "ບໍ່ມີສ່ວນຫຼຸດ" },
                { value: "PERCENT", label: "ເປີເຊັນ" },
                { value: "AMOUNT", label: "ຈຳນວນເງິນ" },
              ]}
              size="middle"
            />
            {discountData.type && (
              <InputNumber
                min={0}
                value={discountData.value}
                onChange={handleDiscountChange}
                placeholder={
                  discountData.type === "PERCENT" ? "0-100" : "ຈຳນວນ"
                }
                addonAfter={discountData.type === "PERCENT" ? "%" : "ກີບ"}
                style={{ width: 120 }}
                size="middle"
              />
            )}
          </Flex>
        </Flex>

        <Divider style={{ margin: "12px 0" }} />

        {/* Total Section */}
        <Flex vertical gap={4} style={{ marginBottom: 16 }}>
          <Flex justify="space-between" align="center">
            <Text>ລວມທັງໝົດ:</Text>
            <Text type="secondary">{formatNumber(subtotal)} ກີບ</Text>
          </Flex>

          <Flex justify="space-between" align="center">
            <TotalPrice type="success">ຍອດຊຳລະຈິງ:</TotalPrice>
            <TotalPrice type="success">
              {formatNumber(totalFinal.lak)} ກີບ
            </TotalPrice>
          </Flex>

          <Flex justify="space-between" align="center">
            <Text type="secondary">ບາດ:</Text>
            <Text type="secondary">{formatNumber(totalFinal.bath)}</Text>
          </Flex>
        </Flex>

        {/* Payment Button */}
        <PaymentButton
          type="primary"
          block
          disabled={!newOrderList.length}
          onClick={() => setIsPayments(true)}
          icon={<DollarOutlined />}
        >
          ຊຳລະເງິນ
        </PaymentButton>
      </Footer>
    </OrderContainer>
  );
};

export default PosOrderList;
