import { Button, Card, Divider, Flex, InputNumber, message, Modal, Tooltip, Typography } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useEffect, useState, useCallback, useMemo } from "react";
import ButtonAction from "../../components/ButtonAction";
import { formatNumber } from "../../utils/helper";
import { calculatediscount } from "./component/calculateDiscount";
import useWindowSize from "./component/useWindowSize";
import '../../styles/orderComponents.css';


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
  const [isExchange, setIsExchange] = useState<{ show: boolean; data: OrderItem | null }>({
    show: false,
    data: null,
  });

  const sumTotalPrice = useMemo(() =>
    newOrderList.reduce((acc, item) => acc + (item.order_total_price || 0), 0),
    [newOrderList]
  );

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

  const removeOrder = useCallback((productId: string) => {
    setNewOrderList(newOrderList.filter(item => item.productId !== productId));
  }, [newOrderList, setNewOrderList]);

  const removeOrderChange = useCallback((order: OrderItem) => {
    setChangeOrderList(changeOrderList.filter(item => item.productId !== order.productId));
    
    const existingItem = oldOrderList.find(item => item.productId === order.productId);
    if (existingItem) {
      setOldOrderList(oldOrderList.map(item =>
        item.productId === order.productId
          ? {
              ...item,
              order_qty: item.order_qty + order.order_qty,
              order_total_price: item.order_total_price + item.price_sale * order.order_qty,
            }
          : item
      ));
    } else {
      setOldOrderList([{ ...order }, ...oldOrderList]);
    }
  }, [changeOrderList, oldOrderList, setChangeOrderList, setOldOrderList]);

  const handleInputChangeOrderQty = useCallback((value: number | null, order: OrderItem) => {
    if (typeof value !== "number" || value === null) {
      message.warning("ກະລຸນາປ້ອນສະເພາະຕົວເລກ");
      return;
    }

    const product = stockData.find(pro => pro.productId?.id === order.productId);
    if (value > product.amount) {
      message.warning(`ຈຳນວນສິນຄ້າບໍ່ພຽງພໍ ຍັງເຫຼືອ ${product.amount}`);
      return;
    }

    setNewOrderList(newOrderList.map(item =>
      item.productId === order.productId
        ? {
            ...item,
            order_qty: value,
            order_total_price: order.price_sale * value,
            commission: product?.commissionStatus ? product.commission * value : 0,
          }
        : item
    ));
  }, [newOrderList, stockData, setNewOrderList]);

  const cancelOrderAll = useCallback(() => {
    Modal.confirm({
      title: "ແຈ້ງເຕືອນ",
      content: (
        <div>
          <span style={{ fontSize: 16, color: "red" }}>
            ທ່ານຕ້ອງການຍົກເລິກລາຍການສັ່ງຊື້ທັງໝົດແທ້ ຫຼື ບໍ່ ?
          </span>
          <div style={{ height: 20 }} />
        </div>
      ),
      okText: "ຢືນຢັນການຍົກເລິກ",
      cancelText: "ປິດອອກ",
      okType: "primary",
      onOk: () => {
        setNewOrderList([]);
        message.success("ຍົກເລິກອໍເດີ້ທັງໝົດສຳເລັດ");
      },
    });
  }, [setNewOrderList]);

  const scrollHeight = windowHeight > 900 ? "60vh" : "52vh";

  console.log("oldOrderList--->",oldOrderList)


  return (
    <div className="posOrderList" style={{ height: "100dvh" }}>
      <Flex justify="space-between" align="center">
        <div className="header">ປ່ຽນເຄື່ອງບິນ</div>
      </Flex>

      <Divider style={{ margin: "10px 0" }} />

      <Flex style={{ height: "80dvh" }}>
        <OrderSection
          title="ລາຍການໃນບິນ"
          items={oldOrderList}
          scrollHeight={scrollHeight}
          onItemClick={item => setIsExchange({ show: true, data: item })}
        />
        <Divider type="vertical" style={{ height: "auto" }} />
        <OrderSection
          title="ລາຍການເພີ່ມໃໝ່"
          items={newOrderList}
          scrollHeight={scrollHeight}
          extra={<span style={{ color: "red", cursor: "pointer" }} onClick={cancelOrderAll}>
            ຍົກເລິກທັງໝົດ
          </span>}
          renderItem={(item, index) => (
            <OrderItem
              item={item}
              index={index}
              onQtyChange={value => handleInputChangeOrderQty(value, item)}
              onRemove={() => removeOrder(item.productId)}
            />
          )}
        />
        <Divider type="vertical" style={{ height: "auto" }} />
        <OrderSection
          title="ລາຍການເຄື່ອງຖືກປ່ຽນ"
          items={changeOrderList}
          scrollHeight={scrollHeight}
          renderItem={(item, index) => (
            <SimpleOrderItem
              item={item}
              index={index}
              onRemove={() => removeOrderChange(item)}
            />
          )}
        />
      </Flex>

      <Divider style={{ margin: "10px 0" }} />

      <ButtonAction
        label="ຢືນຢັນການປ່ຽນ"
        type="primary"
        onClick={() => setIsPayments(true)}
        style={{ backgroundColor: "#1976d2", height: 50 }}
        disabled={newOrderList.length === 0}
      />

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





interface OrderSectionProps {
  title: string;
  items: OrderItem[];
  scrollHeight: string;
  extra?: React.ReactNode;
  onItemClick?: (item: OrderItem) => void;
  renderItem?: (item: OrderItem, index: number) => React.ReactNode;
}

const OrderSection: React.FC<OrderSectionProps> = ({
  title,
  items,
  scrollHeight,
  extra,
  onItemClick,
  renderItem,
}) => {


  return (
    <Card
      size="small"
      title={
        <Flex justify="space-between" align="center">
          <Typography.Text strong style={{ fontSize: 16 }}>
            {title}
          </Typography.Text>
          {extra && (
            <Typography.Text type="danger" style={{ fontSize: 12, cursor: "pointer" }}>
              {extra}
            </Typography.Text>
          )}
        </Flex>
      }
      style={{
        width: "50%",
        borderRadius: 8,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        border: "none",
        padding: 0,
        minHeight:'80dvh',
        maxHeight: scrollHeight,
        overflowY: "auto",
      }}
    >
      {items.length === 0 ? (
        <Flex justify="center" align="center" style={{ padding: 16, color: "#999" }}>
          <Typography.Text>ບໍ່ມີລາຍການ</Typography.Text>
        </Flex>
      ) : (
        items.map((item, index) =>
          renderItem ? (
            renderItem(item, index)
          ) : (
            <div
              key={item.productId}
              className="order-section-item"
              style={{
                padding: "12px 16px",
                cursor: onItemClick ? "pointer" : "default",
                borderBottom: index < items.length - 1 ? "1px solid #f0f0f0" : "none",
                transition: "background-color 0.2s",
              }}
              onClick={() => onItemClick?.(item)}
            >
              <Flex vertical gap={4}>
                <Typography.Text strong style={{ fontSize: 14 }}>
                  {index + 1}. {item?.productName}
                </Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {item?.order_qty} × {formatNumber(item?.price_sale)} ={" "}
                  <span style={{ color: "#1890ff" }}>{formatNumber(item?.order_total_price)}</span>
                </Typography.Text>
              </Flex>
            </div>
          )
        )
      )}
    </Card>
  );
};

interface OrderItemProps {
  item: OrderItem;
  index: number;
  onQtyChange: (value: number | null) => void;
  onRemove: () => void;
}

const OrderItem: React.FC<OrderItemProps> = ({ item, index, onQtyChange, onRemove }) => {
  return (
    <Card
      size="small"
      className="order-item"
      style={{
        marginBottom: 8,
        borderRadius: 8,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        backgroundColor: index === 0 ? "#f9faff" : "#fff",
        transition: "all 0.2s",
        border: "none",
      }}
      hoverable
    >
      <Flex vertical gap={8}>
        {/* HeaderDeadline Header */}
        <Flex justify="space-between" align="center">
          <Typography.Text strong style={{ fontSize: 14, maxWidth: "80%", }}>
            {index + 1}. {item.productName}
          </Typography.Text>
          <Tooltip title="ລຶບລາຍການ">
            <Button
              danger
              type="text"
              shape="circle"
              size="small"
              icon={<CloseOutlined />}
              onClick={onRemove}
              style={{
                minWidth: 24,
                height: 24,
              }}
            />
          </Tooltip>
        </Flex>

        {/* Price and Quantity */}
        <Flex justify="space-between" vertical={true} gap={8}>
          <div>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {formatNumber(item.price_sale)} ກີບ ×
          </Typography.Text>
          {" "}
          <InputNumber
            size="small"
            min={1}
            value={item.order_qty}
            onChange={onQtyChange}
            style={{
              width: 90,
              borderRadius: 4,
            }}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            parser={value => value ? parseFloat(value.replace(/(,*)/g, "")) : 0}
          />
          </div>


          <Typography.Text strong style={{ fontSize: 14}}>
            {formatNumber(item.order_total_price)} ກີບ
          </Typography.Text>
        </Flex>
      </Flex>
    </Card>
  );
};


interface SimpleOrderItemProps {
  item: OrderItem;
  index: number;
  onRemove: () => void;
}

const SimpleOrderItem: React.FC<SimpleOrderItemProps> = ({ item, index, onRemove }) => {
  return (
    <Card
      size="small"
      className="simple-order-item"
      style={{
        marginBottom: 8,
        borderRadius: 8,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        backgroundColor: index === 0 ? "#f9faff" : "#fff",
        border: "none",
        transition: "all 0.2s",
      }}
      hoverable
      bodyStyle={{ padding: 12 }}
    >
      <Flex justify="space-between" align="center" gap={12}>
        <Flex vertical gap={4} style={{ flex: 1 }}>
          <Typography.Text strong style={{ fontSize: 14 }}>
            {index + 1}. {item.productName}
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {item.order_qty} × {formatNumber(item.price_sale)} ={" "}
            <span style={{ color: "#1890ff" }}>{formatNumber(item.order_total_price)}</span>
          </Typography.Text>
        </Flex>
        <Button
          danger
          type="text"
          shape="circle"
          size="small"
          icon={<CloseOutlined />}
          onClick={onRemove}
          style={{
            minWidth: 24,
            height: 24,
          }}
        />
      </Flex>
    </Card>
  );
};

interface ExchangeModalProps {
  isOpen: boolean;
  data: OrderItem | null;
  onCancel: () => void;
  oldOrderList: OrderItem[];
  changeOrderList: OrderItem[];
  setOldOrderList: (list: OrderItem[]) => void;
  setChangeOrderList: (list: OrderItem[]) => void;
}

const ExchangeModal: React.FC<ExchangeModalProps> = ({
  isOpen,
  data,
  onCancel,
  oldOrderList,
  changeOrderList,
  setOldOrderList,
  setChangeOrderList,
}) => {
  const [qtyChange, setQtyChange] = useState(0);

  const handleConfirm = useCallback(() => {
    if (!data || qtyChange <= 0) {
      message.warning("ກະລຸນາປ້ອນຈຳນວນທີ່ຕ້ອງການປ່ຽນ");
      return;
    }
    if (qtyChange > data.order_qty) {
      message.warning("ຈຳນວນທີ່ຕ້ອງການປ່ຽນຫຼາຍກວ່າຈຳນວນມີຢູ່");
      return;
    }

    const existingItem = changeOrderList.find(item => item.productId === data.productId);
    const newOrderData = {
      ...data,
      order_qty: qtyChange,
      order_total_price: data.price_sale * qtyChange,
    };

    if (existingItem) {
      setChangeOrderList(changeOrderList.map(item =>
        item.productId === data.productId
          ? { ...item, order_qty: item.order_qty + qtyChange, order_total_price: item.order_total_price + data.price_sale * qtyChange }
          : item
      ));
    } else {
      setChangeOrderList([newOrderData, ...changeOrderList]);
    }

    if (qtyChange === data.order_qty) {
      setOldOrderList(oldOrderList.filter(item => item.productId !== data.productId));
    } else {
      setOldOrderList(oldOrderList.map(item =>
        item.productId === data.productId
          ? { ...item, order_qty: item.order_qty - qtyChange, order_total_price: item.order_total_price - data.price_sale * qtyChange }
          : item
      ));
    }

    setQtyChange(0);
    onCancel();
  }, [data, qtyChange, changeOrderList, oldOrderList, setChangeOrderList, setOldOrderList, onCancel]);

  return (
    <Modal
      title={<>ຊື່ລາຍການທີ່ຕ້ອງການປ່ຽນ: <span style={{ color: "gray" }}>{data?.productName}</span></>}
      open={isOpen}
      onOk={handleConfirm}
      onCancel={onCancel}
      cancelText="ປິດອອກ"
      okText="ຢືນຢັນ"
    >
      <p style={{ color: "gray" }}>ປ້ອນຈຳນວນຕ້ອງການປ່ຽນ</p>
      <InputNumber
        size="large"
        min={0}
        value={qtyChange}
        style={{ width: "100%" }}
        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        parser={value => value ? parseFloat(value.replace(/(,*)/g, "")) : 0}
        onChange={value => typeof value === "number" && setQtyChange(value)}
      />
    </Modal>
  );
};

export default ChangeOrderList;