import {
  Button,
  Card,
  Empty,
  Flex,
  InputNumber,
  message,
  Modal,
  Space,
  Statistic,
  Steps,
  Tag,
  Typography,
} from "antd";
import {
  CloseOutlined,
  CheckOutlined,
  SwapOutlined,
  LeftOutlined,
  RightOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useEffect, useState, useCallback, useMemo } from "react";
import ButtonAction from "../../components/ButtonAction";
import { formatNumber } from "../../utils/helper";
import { calculatediscount } from "./component/calculateDiscount";
import useWindowSize from "./component/useWindowSize";
import "../../styles/orderComponents.css";

interface OrderItem {
  productId: string;
  productName: string;
  price_sale: number;
  order_qty: number;
  order_total_price: number;
  commission: number;
}

interface ExchangeRate {
  bath: number;
  usd: number;
}

interface TotalAmount {
  lak: number;
  bath: number;
  usd: number;
}

interface ChangeOrderListProps {
  newOrderList: OrderItem[];
  oldOrderList: OrderItem[];
  changeOrderList: OrderItem[];
  exchange: ExchangeRate;
  stockData: any[];
  setNewOrderList: (list: OrderItem[]) => void;
  setOldOrderList: (list: OrderItem[]) => void;
  setChangeOrderList: (list: OrderItem[]) => void;
  setIsPayments: (value: boolean) => void;
  typeDiscount: string;
  setTypeDiscount: (value: string) => void;
  discount: number;
  setDiscount: (value: number) => void;
  totalFinal: TotalAmount;
  setTotalFinal: (value: TotalAmount) => void;
}

const ChangeOrderList: React.FC<ChangeOrderListProps> = ({
  newOrderList,
  setNewOrderList,
  setIsPayments,
  exchange,
  typeDiscount,
  discount,
  setTotalFinal,
  oldOrderList,
  setOldOrderList,
  changeOrderList,
  setChangeOrderList,
  stockData,
}) => {
  const { height: windowHeight = 0 } = useWindowSize();
  const [isExchange, setIsExchange] = useState<{
    show: boolean;
    data: OrderItem | null;
  }>({
    show: false,
    data: null,
  });
  const [currentStep, setCurrentStep] = useState(0);

  const sumTotalPrice = useMemo(
    () => newOrderList.reduce((acc, item) => acc + (item.order_total_price || 0), 0),
    [newOrderList]
  );

  const exchangedItemsTotal = useMemo(
    () => changeOrderList.reduce((acc, item) => acc + (item.order_total_price || 0), 0),
    [changeOrderList]
  );

  // const oldOrderTotal = useMemo(
  //   () => oldOrderList.reduce((acc, item) => acc + (item.order_total_price || 0), 0),
  //   [oldOrderList]
  // );

  const priceDifference = useMemo(() => {
    return sumTotalPrice - exchangedItemsTotal;
  }, [sumTotalPrice, exchangedItemsTotal]);

  const updateTotalFinal = useCallback(() => {
    if (typeDiscount) {
      setTotalFinal(calculatediscount(typeDiscount, discount, sumTotalPrice, exchange));
    } else {
      setTotalFinal({
        lak: Math.round(sumTotalPrice),
        bath: Math.round(sumTotalPrice / (exchange?.bath || 1)),
        usd: Math.round(sumTotalPrice / (exchange?.usd || 1)),
      });
    }
  }, [typeDiscount, discount, sumTotalPrice, exchange, setTotalFinal]);

  useEffect(() => {
    updateTotalFinal();
  }, [updateTotalFinal]);

  const removeOrder = useCallback(
    (productId: string) => {
      setNewOrderList(newOrderList.filter((item) => item.productId !== productId));
    },
    [newOrderList, setNewOrderList]
  );

  const removeOrderChange = useCallback(
    (order: OrderItem) => {
      setChangeOrderList(changeOrderList.filter((item) => item.productId !== order.productId));
      const existingItem = oldOrderList.find((item) => item.productId === order.productId);
      if (existingItem) {
        setOldOrderList(
          oldOrderList.map((item) =>
            item.productId === order.productId
              ? {
                  ...item,
                  order_qty: item.order_qty + order.order_qty,
                  order_total_price: item.order_total_price + item.price_sale * order.order_qty,
                }
              : item
          )
        );
      } else {
        setOldOrderList([{ ...order }, ...oldOrderList]);
      }
    },
    [changeOrderList, oldOrderList, setChangeOrderList, setOldOrderList]
  );

  const handleInputChangeOrderQty = useCallback(
    (value: number | null, order: OrderItem) => {
      if (typeof value !== "number" || value === null) {
        message.warning("ກະລຸນາປ້ອນສະເພາະຕົວເລກ");
        return;
      }
      const product = stockData.find((pro) => pro.productId?.id === order.productId);
      if (value > product.amount) {
        message.warning(`ຈຳນວນສິນຄ້າບໍ່ພຽງພໍ ຍັງເຫຼືອ ${product.amount}`);
        return;
      }
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
    },
    [newOrderList, stockData, setNewOrderList]
  );

  const cancelOrderAll = useCallback(() => {
    Modal.confirm({
      title: "ຍົກເລິກທັງໝົດ?",
      content: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການຍົກເລິກລາຍການສັ່ງຊື້ທັງໝົດ?",
      okText: "ຢືນຢັນ",
      cancelText: "ຍົກເລີກ",
      onOk: () => {
        setNewOrderList([]);
        message.success("ຍົກເລິກສຳເລັດ");
      },
    });
  }, [setNewOrderList]);

  const moveToNextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 2));
  };

  const moveToPrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const scrollHeight = windowHeight > 900 ? "60vh" : "50vh";

  const steps = [
    {
      title: "ເລືອກສິນຄ້າທີ່ຕ້ອງການປ່ຽນ",
      content: (
        <OrderSection
          title="ເລືອກສິນຄ້າທີ່ຕ້ອງການປ່ຽນ"
          items={oldOrderList}
          scrollHeight={scrollHeight}
          onItemClick={(item) => setIsExchange({ show: true, data: item })}
          extra={
            <Typography.Text type="secondary">
              ຄິກທີ່ລາຍການເພື່ອປ່ຽນ
            </Typography.Text>
          }
        />
      ),
    },
    {
      title: "ເລືອກສິນຄ້າໃໝ່",
      content: (
        <OrderSection
          title="ເລືອກສິນຄ້າໃໝ່"
          items={newOrderList}
          scrollHeight={scrollHeight}
          renderItem={(item, index) => (
            <OrderItem
              item={item}
              index={index}
              onQtyChange={(value) => handleInputChangeOrderQty(value, item)}
              onRemove={() => removeOrder(item.productId)}
            />
          )}
        />
      ),
    },
    {
      title: "ກວດສອບແລະຢືນຢັນ",
      content: (
        <div>
          <OrderSection
            title="ລາຍການທີ່ຖືກປ່ຽນ"
            items={changeOrderList}
            scrollHeight={scrollHeight}
            renderItem={(item, index) => (
              <OrderItem
                item={item}
                index={index}
                onRemove={() => removeOrderChange(item)}
                readOnly
              />
            )}
          />
          
          <OrderSection
            title="ລາຍການໃໝ່"
            items={newOrderList}
            scrollHeight={scrollHeight}
            renderItem={(item, index) => (
              <OrderItem
                item={item}
                index={index}
                onQtyChange={(value) => handleInputChangeOrderQty(value, item)}
                onRemove={() => removeOrder(item.productId)}
              />
            )}
          />
          
          <Card style={{ marginTop: 16 }}>
            <Flex justify="space-between" align="center">
              <Space direction="vertical">
                <Typography.Text>ມູນຄ່າສິນຄ້າທີ່ປ່ຽນ: <Typography.Text strong>{formatNumber(exchangedItemsTotal)} ກີບ</Typography.Text></Typography.Text>
                <Typography.Text>ມູນຄ່າສິນຄ້າໃໝ່: <Typography.Text strong>{formatNumber(sumTotalPrice)} ກີບ</Typography.Text></Typography.Text>
              </Space>
              
              <Statistic 
                title="ຜິດດ່ຽງ" 
                value={priceDifference} 
                precision={0}
                prefix={priceDifference >= 0 ? "+" : ""}
                suffix=" ກີບ"
                valueStyle={{ color: priceDifference >= 0 ? '#3f8600' : '#cf1322' }}
                formatter={value => formatNumber(value as number)}
              />
            </Flex>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div className="pos-order-container" style={{ padding: 16, height: "100dvh" }}>
      {/* Header */}
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          ປ່ຽນເຄື່ອງບິນ
        </Typography.Title>
        <Button type="text" onClick={cancelOrderAll} icon={<DeleteOutlined />}>
          <Typography.Text type="danger">ຍົກເລິກທັງໝົດ</Typography.Text>
        </Button>
      </Flex>

      {/* Steps */}
      <Steps
        current={currentStep}
        items={steps.map((item) => ({ title: item.title }))}
        style={{ marginBottom: 16 }}
      />

      {/* Content */}
      <div style={{ margin: "16px 0", minHeight: scrollHeight }}>
        {steps[currentStep].content}
      </div>

      {/* Navigation */}
      <Flex justify="space-between" style={{ marginTop: 16 }}>
        <Button 
          onClick={moveToPrevStep} 
          disabled={currentStep === 0}
          icon={<LeftOutlined />}
        >
          ກັບຄືນ
        </Button>
        
        {currentStep === steps.length - 1 ? (
          <ButtonAction
            label="ຢືນຢັນການປ່ຽນ"
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => setIsPayments(true)}
            disabled={newOrderList.length === 0 || changeOrderList.length === 0}
            style={{ height: 40, backgroundColor: "#1976d2" }}
          />
        ) : (
          <Button 
            type="primary" 
            onClick={moveToNextStep}
            disabled={(currentStep === 0 && changeOrderList.length === 0) || 
                    (currentStep === 1 && newOrderList.length === 0)}
            icon={<RightOutlined />}
          >
            ຕໍ່ໄປ
          </Button>
        )}
      </Flex>

      {/* Exchange Modal */}
      <ExchangeModal
        isOpen={isExchange.show}
        data={isExchange.data}
        onCancel={() => setIsExchange({ show: false, data: null })}
        oldOrderList={oldOrderList}
        changeOrderList={changeOrderList}
        setOldOrderList={setOldOrderList}
        setChangeOrderList={setChangeOrderList}
      />
    </div>
  );
};

// Improved Order Section
const OrderSection: React.FC<{
  title?: string;
  items: OrderItem[];
  scrollHeight: string | number;
  onItemClick?: (item: OrderItem) => void;
  renderItem?: (item: OrderItem, index: number) => React.ReactNode;
  extra?: React.ReactNode;
}> = ({ title, items, scrollHeight, onItemClick, renderItem, extra }) => (
  <Card 
    title={title} 
    extra={extra}
    style={{ marginBottom: 16 }}
    bodyStyle={{ 
      padding: 12,
      maxHeight: typeof scrollHeight === 'string' ? scrollHeight : `${scrollHeight}px`,
      overflowY: "auto" 
    }}
  >
    {items.length === 0 ? (
      <Empty description="ບໍ່ມີລາຍການ" />
    ) : (
      items.map((item, index) =>
        renderItem ? (
          renderItem(item, index)
        ) : (
          <Flex
            key={item.productId}
            justify="space-between"
            align="center"
            style={{
              padding: "12px",
              borderRadius: 8,
              border: "1px solid #f0f0f0",
              marginBottom: 8,
              cursor: onItemClick ? "pointer" : "default",
              backgroundColor: "#fafafa",
            }}
            onClick={() => onItemClick?.(item)}
          >
            <Flex vertical>
              <Typography.Text strong>
                {item.productName}
              </Typography.Text>
              <Flex align="center" gap={8}>
                <Typography.Text type="secondary">
                  {item.order_qty} × {formatNumber(item.price_sale)}
                </Typography.Text>
                <Typography.Text style={{ color: "#52c41a" }}>
                  = {formatNumber(item.order_total_price)} ກີບ
                </Typography.Text>
              </Flex>
            </Flex>
            {onItemClick && (
              <Tag color="blue" icon={<SwapOutlined />}>ປ່ຽນ</Tag>
            )}
          </Flex>
        )
      )
    )}
  </Card>
);

// Enhanced Order Item
const OrderItem: React.FC<{
  item: OrderItem;
  index: number;
  onQtyChange?: (value: number | null) => void;
  onRemove: () => void;
  readOnly?: boolean;
}> = ({ item,index, onQtyChange, onRemove, readOnly }) => (
  <Flex
    justify="space-between"
    align="center"
    style={{
      padding: "12px",
      background: "#fafafa",
      borderRadius: 8,
      marginBottom: 8,
      border: "1px solid #f0f0f0",
    }}
    key={index}
  >
    <Flex vertical style={{ flex: 1 }}>
      <Typography.Text strong>
        {item.productName}
      </Typography.Text>
      <Flex align="center" gap={8}>
        {readOnly ? (
          <Typography.Text type="secondary">
            {item.order_qty} × {formatNumber(item.price_sale)}
          </Typography.Text>
        ) : (
          <>
            <InputNumber
              size="small"
              min={1}
              value={item.order_qty}
              onChange={onQtyChange}
              style={{ width: 80 }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => (value ? parseFloat(value.replace(/(,*)/g, "")) : 0)}
            />
            <Typography.Text type="secondary">× {formatNumber(item.price_sale)}</Typography.Text>
          </>
        )}
        <Typography.Text strong style={{ color: "#52c41a" }}>
          = {formatNumber(item.order_total_price)} ກີບ
        </Typography.Text>
      </Flex>
    </Flex>
    <Button
      type="text"
      danger
      icon={<CloseOutlined />}
      onClick={onRemove}
      size="small"
    />
  </Flex>
);

// Improved Exchange Modal
const ExchangeModal: React.FC<{
  isOpen: boolean;
  data: OrderItem | null;
  onCancel: () => void;
  oldOrderList: OrderItem[];
  changeOrderList: OrderItem[];
  setOldOrderList: (list: OrderItem[]) => void;
  setChangeOrderList: (list: OrderItem[]) => void;
}> = ({ isOpen, data, onCancel, oldOrderList, changeOrderList, setOldOrderList, setChangeOrderList }) => {
  const [qtyChange, setQtyChange] = useState(0);

  useEffect(() => {
    if (isOpen && data) {
      setQtyChange(data.order_qty);
    } else {
      setQtyChange(0);
    }
  }, [isOpen, data]);

  const handleConfirm = useCallback(() => {
    if (!data || qtyChange <= 0) {
      message.warning("ກະລຸນາປ້ອນຈຳນວນ");
      return;
    }
    if (qtyChange > data.order_qty) {
      message.warning("ຈຳນວນຫຼາຍກວ່າທີ່ມີ");
      return;
    }
    const newOrderData = { ...data, order_qty: qtyChange, order_total_price: data.price_sale * qtyChange };
    const existingItem = changeOrderList.find((item) => item.productId === data.productId);
    if (existingItem) {
      setChangeOrderList(
        changeOrderList.map((item) =>
          item.productId === data.productId
            ? { ...item, order_qty: item.order_qty + qtyChange, order_total_price: item.order_total_price + data.price_sale * qtyChange }
            : item
        )
      );
    } else {
      setChangeOrderList([newOrderData, ...changeOrderList]);
    }
    if (qtyChange === data.order_qty) {
      setOldOrderList(oldOrderList.filter((item) => item.productId !== data.productId));
    } else {
      setOldOrderList(
        oldOrderList.map((item) =>
          item.productId === data.productId
            ? { ...item, order_qty: item.order_qty - qtyChange, order_total_price: item.order_total_price - data.price_sale * qtyChange }
            : item
        )
      );
    }
    setQtyChange(0);
    onCancel();
  }, [data, qtyChange, changeOrderList, oldOrderList, setChangeOrderList, setOldOrderList, onCancel]);

  return (
    <Modal
      title={
        <Flex align="center" gap={8}>
          <SwapOutlined /> 
          <span>ປ່ຽນສິນຄ້າ: {data?.productName}</span>
        </Flex>
      }
      open={isOpen}
      onOk={handleConfirm}
      onCancel={onCancel}
      okText="ຢືນຢັນການປ່ຽນ"
      cancelText="ຍົກເລີກ"
      okButtonProps={{ 
        icon: <CheckOutlined />,
        style: { backgroundColor: "#1976d2" } 
      }}
    >
      <Card style={{ marginBottom: 16 }}>
        <Statistic
          title="ມູນຄ່າສິນຄ້າ"
          value={data?.order_total_price || 0}
          suffix=" ກີບ"
          formatter={value => formatNumber(value as number)}
        />
        <Flex gap={8} align="center" style={{ marginTop: 8 }}>
          <Typography.Text type="secondary">
            {data?.order_qty || 0} × {formatNumber(data?.price_sale || 0)}
          </Typography.Text>
        </Flex>
      </Card>

      <Typography.Title level={5}>ຈຳນວນທີ່ຕ້ອງການປ່ຽນ</Typography.Title>
      <Flex gap={16} align="center">
        <InputNumber
          min={1}
          max={data?.order_qty}
          value={qtyChange}
          onChange={(value) => typeof value === "number" && setQtyChange(value)}
          style={{ width: "100%", marginTop: 8 }}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          parser={(value) => (value ? parseFloat(value.replace(/(,*)/g, "")) : 0)}
          addonAfter={<Typography.Text type="secondary">ຈາກ {data?.order_qty || 0}</Typography.Text>}
          size="large"
        />
      </Flex>

      {data && qtyChange > 0 && (
        <Card style={{ marginTop: 16 }}>
          <Typography.Text>
            ຈະປ່ຽນສິນຄ້າມູນຄ່າ: <Typography.Text strong>{formatNumber(data.price_sale * qtyChange)} ກີບ</Typography.Text>
          </Typography.Text>
        </Card>
      )}
    </Modal>
  );
};

export default ChangeOrderList;