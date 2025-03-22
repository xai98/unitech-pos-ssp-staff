import {
  Button,
  Divider,
  Flex,
  InputNumber,
  message,
  Modal,
  Tooltip,
} from "antd";
import * as _ from "lodash";
import ButtonAction from "../../components/ButtonAction";
import { formatNumber } from "../../utils/helper";
import { CloseOutlined, DeleteOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { calculatediscount } from "./component/calculateDiscount";
import useWindowSize from "./component/useWindowSize";

interface ChangeOrderList {
  newOrderList: any[];
  oldOrderList: any[];
  changeOrderList: any[];
  exchange: any;
  setNewOrderList: (newOrderList: any[]) => void;
  setOldOrderList: (oldOrderList: any[]) => void;
  setChangeOrderList: (changeOrderList: any[]) => void;
  setIsPayments: (isPayments: boolean) => void;
  typeDiscount: string;
  setTypeDiscount: (typeDiscount: string) => void;
  discount: number;
  setDiscount: (discount: number) => void;
  totalFinal: {
    lak: number;
    bath: number;
    usd: number;
  };
  setTotalFinal: (totalFinal: {
    lak: number;
    bath: number;
    usd: number;
  }) => void;
  stockData: any[];
}

const ChangeOrderList: React.FC<ChangeOrderList> = ({
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
  const { height: widowHeight = 0 } = useWindowSize();

  const [isExchange, setIsExchange] = useState({ show: false, data: null });

  useEffect(() => {
    if (typeDiscount) {
      // คำนวณผลลัพธ์ของส่วนลด
      const result = calculatediscount(
        typeDiscount,
        discount,
        sumTotalPrice,
        exchange
      );
      // อัปเดตค่า totalFinal
      setTotalFinal(result);
    } else {
      setTotalFinal({
        lak: Math.round(sumTotalPrice),
        bath: Math.round(sumTotalPrice / (exchange?.bath || 1)),
        usd: Math.round(sumTotalPrice / (exchange?.usd || 1)),
      });
    }
  }, [newOrderList]);

  //ລຶບລາຍການ
  const removeOrder = (itemId: string) => {
    // Create a new list excluding the item with the specified itemId
    const updatedList = newOrderList.filter(
      (item) => item.productId !== itemId
    );
    // Update the state with the new list
    setNewOrderList(updatedList);
  };

  const removeOrderChange = (order: any) => {
    const updatedChangeList = changeOrderList.filter(
      (item) => item.productId !== order?.productId
    );
    // Update the state with the change list
    setChangeOrderList(updatedChangeList);

    //update to old order
    const existingItem = oldOrderList.find(
      (item) => item.productId === order?.productId
    );

    if (existingItem) {
      const updatedList = oldOrderList.map((item) =>
        item.productId === order?.productId
          ? {
              ...item,
              order_qty: item.order_qty + order?.order_qty,
              order_total_price:
                item.order_total_price + item?.price_sale * order?.order_qty,
              commission: item?.commission,
            }
          : item
      );

      setOldOrderList(updatedList);
    } else {
      const olOrder = { ...order };
      setOldOrderList([olOrder, ...oldOrderList]);
    }
  };

  //ລວມຍອດເງິນ
  const sumTotalPrice =
    newOrderList &&
    newOrderList?.reduce((acc, item) => {
      return acc + (item.order_total_price || 0); // Assuming total_price is a number
    }, 0);

  //ຍົກເລິກອໍເດີທັງໝົດ
  const cancelOrderAll = () => {
    Modal.confirm({
      title: "ແຈ້ງເຕືອນ",
      content: (
        <div>
          <span style={{ fontSize: 16, color: "red" }}>
            ທ່ານຕ້ອງການຍົກເລິກລາຍການສັ່ງຊື້ທັງໝົດແທ້ ຫຼື ບໍ່ ?
          </span>
          <div style={{ height: 20 }}></div>
        </div>
      ),
      okText: "ຢືນຢັນການຍົກເລິກ",
      cancelText: "ປິດອອກ",
      okType: "primary",
      onOk() {
        setNewOrderList([]);
        message.success("ຍົກເລິກອໍເດີ້ທັງໝົດສຳເລັດ");
      },
    });
  };

  const handleInputChangeOrderQty = (value: number | null, order: any) => {
    // ตรวจสอบว่าค่า value เป็น string หรือ null และแสดงข้อความเตือนตามเงื่อนไข
    if (typeof value === "string") {
      message.warning("ກະລຸນາປ້ອນສະເພາະຕົວເລກ");
      return;
    }

    if (value === null) {
      message.warning("ກະລຸນາປ້ອນຈຳນວນອໍເດີ້");
      return;
    }

    const findProduct = stockData?.find((pro:any) => pro.productId?.id === order.productId);

    if(value > findProduct.amount){
     return message.warning(`ຈຳນວນສິນຄ້າບໍ່ພຽງພໍຈຳນວນ ${findProduct.amount - value} ສິນຄ້າຕົວຈິງຍັງເຫຼືອ ${findProduct.amount}`);
    }

    // อัปเดตสถานะด้วยค่าที่เป็นตัวเลขที่ถูกต้อง
    const updatedList = newOrderList?.map((item) => {
      if (item.productId === order?.productId) {
        return {
          ...item,
          order_qty: value,
          order_total_price: order?.price_sale * value || 1,
          commission: findProduct?.commissionStatus
          ? findProduct.commission * value
          : 0,
        };
      }
      return item;
    });

    setNewOrderList(updatedList);
  };

  const handleChooseOrderChange = (order: any) => {
    setIsExchange({ show: true, data: order });
  };

  return (
    <div className="posOrderList">
      <Flex justify={"space-between"} align={"center"}>
        <div className="header">ປ່ຽນເຄື່ອງບິນ: {}</div>
      </Flex>

      <div style={{ height: 10 }}></div>
      <Divider style={{ margin: 0 }} />

      <Flex justify={"left"} style={{ height: "70vh" }}>
        <div style={{ width: "50%", padding: 5 }}>
          <div style={{ fontWeight: "bold" }}>ເລືອກລາຍການຕ້ອງປ່ຽນ</div>
          <div
            style={{
              height: widowHeight > 900 ? "60vh" : "52vh",
              overflow: "scroll",
            }}
          >
            {oldOrderList?.map((item, index) => (
              <Tooltip title="ຄລິກເພື່ອປ່ຽນ">
                <div
                  className="order-item"
                  key={item?.productId}
                  style={{
                    padding: 10,
                    borderBottom: "1px solid #eee",
                    cursor: "pointer",
                    transition: "background-color 0.3s ease",
                  }}
                  onClick={() => handleChooseOrderChange(item)}
                >
                  <Flex
                    justify={"space-between"}
                    align={"center"}
                    style={{ fontSize: 16 }}
                  >
                    <div>
                      {index + 1}. {item?.productName}
                    </div>
                  </Flex>
                  <Flex
                    justify="start"
                    align="center"
                    gap={10}
                    style={{ color: "gray", paddingLeft: 20 }}
                  >
                    <div>
                      {item?.order_qty} x {formatNumber(item.price_sale)} ={" "}
                      {formatNumber(item.order_total_price)}
                    </div>
                  </Flex>
                </div>
              </Tooltip>
            ))}
          </div>
        </div>
        <Divider type="vertical" style={{ height: "70vh" }} />

        <div style={{ width: "50%", padding: 5 }}>
          <div style={{ fontWeight: "bold" }}>
            ລາຍການເພີ່ມໃໝ່
          </div>
          <span style={{ color: "red",cursor:'pointer' }} onClick={cancelOrderAll}>ຄລິກເພື່ອຍົກເລິກທັງໝົດ</span>
            <div style={{height:10}}></div>
          <div
            style={{
              height: widowHeight > 900 ? "60vh" : "52vh",
              overflow: "scroll",
            }}
          >
            {newOrderList?.map((item, index) => (
              <div
                className="order-item"
                key={item?.productId}
                style={{
                  backgroundColor: index === 0 ? "#f0f9ff" : "",
                  padding: 10,
                  borderBottom: "1px solid #eee",
                }}
              >
                <Flex
                  justify={"space-between"}
                  align={"center"}
                  style={{ fontSize: 16 }}
                >
                  <div>
                    {index + 1}. {item?.productName}
                  </div>
                 
                </Flex>
                <Flex
                  justify="start"
                  align="center"
                  gap={10}
                  style={{ paddingLeft: 10 }}
                >
                  {formatNumber(item.price_sale)} x{" "}
                  <InputNumber
                    size="large"
                    autoComplete="off"
                    min={1}
                    value={item?.order_qty}
                    style={{
                      width: "25%",
                      padding: 0,
                      height: 30,
                      margin: 0,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) =>
                      value ? parseFloat(value.replace(/(,*)/g, "")) : 0
                    }
                    // onChange={handleChangeDiscount}
                    onChange={(e) => handleInputChangeOrderQty(e, item)}
                  />
                   <Tooltip title="ລຶບລາຍການ">
                    <Button
                      type="primary"
                      style={{ backgroundColor: "red" }}
                      shape="circle"
                      icon={<DeleteOutlined />}
                      onClick={() => removeOrder(item.productId)}
                    />
                  </Tooltip>
                </Flex>
                <div style={{ height: 5 }}></div>
                <Flex
                  justify="space-between"
                  align="center"
                  gap={10}
                  style={{ fontSize: 14, color: "gray", paddingLeft: 10 }}
                >
                  <div>ລວມ: {formatNumber(item.order_total_price)} ກີບ</div>
                </Flex>
              </div>
            ))}
          </div>
        </div>
        <Divider type="vertical" style={{ height: "70vh" }} />
        <div style={{ width: "50%", padding: 5 }}>
          <div style={{ fontWeight: "bold" }}>ລາຍການເຄື່ອງຕ້ອງປ່ຽນ</div>

          <div
            style={{
              height: widowHeight > 900 ? "60vh" : "52vh",
              overflow: "scroll",
            }}
          >
            {changeOrderList?.map((item, index) => (
              <div
                className="order-item"
                key={item?.productId}
                style={{
                  backgroundColor: index === 0 ? "#f0f9ff" : "",
                  padding: 10,
                  borderBottom: "1px solid #eee",
                }}
              >
                <Flex
                  justify={"space-between"}
                  align={"center"}
                  style={{ fontSize: 16 }}
                >
                  <div>
                    {index + 1}. {item?.productName}
                  </div>
                  <Tooltip title="ລຶບລາຍການ">
                    <Button
                      type="primary"
                      style={{ backgroundColor: "red" }}
                      shape="circle"
                      icon={<CloseOutlined />}
                      onClick={() => removeOrderChange(item)}
                    />
                  </Tooltip>
                </Flex>
                <Flex
                  justify="start"
                  align="center"
                  gap={10}
                  style={{ paddingLeft: 10, color: "gray" }}
                >
                  {item?.order_qty} x {formatNumber(item.price_sale)} ={" "}
                  {formatNumber(item.order_total_price)}
                </Flex>
              </div>
            ))}
          </div>
        </div>
      </Flex>

      <Divider style={{ margin: 0 }} />

      <div style={{ height: 10 }}></div>

      <ButtonAction
        label="ຢືນຢັນການປ່ຽນ"
        type="primary"
        onClick={() => setIsPayments(true)}
        htmlType="button"
        style={{
          backgroundColor:"#1976d2",
          height: 50,
        }}
        disabled={newOrderList?.length <= 0}
      />

      <ExchangeModal
        isExchange={isExchange?.show}
        data={isExchange?.data}
        handleCancel={() => setIsExchange({ show: false, data: null })}
        changeOrderList={changeOrderList}
        setChangeOrderList={setChangeOrderList}
        oldOrderList={oldOrderList}
        setOldOrderList={setOldOrderList}
      />
    </div>
  );
};

interface ExchangeProps {
  isExchange: boolean;
  data: any;
  handleCancel: () => void;
  oldOrderList: any[];
  changeOrderList: any[];
  setOldOrderList: (oldOrderList: any[]) => void;
  setChangeOrderList: (changeOrderList: any[]) => void;
}

const ExchangeModal: React.FC<ExchangeProps> = ({
  handleCancel,
  isExchange,
  data,
  setOldOrderList,
  oldOrderList,
  changeOrderList,
  setChangeOrderList,
}) => {
  const [qtyChange, setQtyChange] = useState(0);

  const handleInputChangeOrderQty = (value: number | null) => {
    // ตรวจสอบว่าค่า value เป็น string หรือ null และแสดงข้อความเตือนตามเงื่อนไข
    if (typeof value === "string") {
      message.warning("ກະລຸນາປ້ອນສະເພາະຕົວເລກ");
      return;
    }

    if (value === null) {
      message.warning("ກະລຸນາປ້ອນຈຳນວນອໍເດີ້");
      return;
    }

    if (value > data.order_qty) {
      message.warning("ຈຳນວນທີ່ຕ້ອງການປ່ຽນຫຼາຍກວ່າຈຳນວນມີຢູ່");
      return;
    }

    setQtyChange(value);
  };

  const handleConfirm = () => {
    if (qtyChange <= 0) return message.warning("ກະລຸນາປ້ອນຈຳນວນທີ່ຕ້ອງການປ່ຽນ");
    if (qtyChange > data.order_qty)
      return message.warning("ຈຳນວນທີ່ຕ້ອງການປ່ຽນຫຼາຍກວ່າຈຳນວນມີຢູ່");

    const existingItem = changeOrderList.find(
      (item) => item.productId === data?.productId
    );

    if (existingItem) {
      //todo: update change order
      const changeList = changeOrderList.map((item) =>
        item.productId === data?.productId
          ? {
              ...item,
              order_qty: item.order_qty + qtyChange,
              order_total_price:
                item.order_total_price + item?.price_sale * qtyChange,
              commission: item.commission,
            }
          : item
      );

      setChangeOrderList(changeList);
      //check qty change equal
      if (qtyChange === data.order_qty) {
        const updatedList = oldOrderList.filter(
          (item) => item.productId !== data?.productId
        );
        // Update the state with the old list
        setOldOrderList(updatedList);
      } else {
        //todo: update old order
        const updatedOldOrderList = oldOrderList.map((item) =>
          item.productId === data?.productId
            ? {
                ...item,
                order_qty: item.order_qty - qtyChange,
                order_total_price:
                  item?.price_sale * qtyChange > item.order_total_price
                    ? item?.price_sale * qtyChange - item.order_total_price
                    : item.order_total_price - item?.price_sale * qtyChange,
                commission: item.commission,
              }
            : item
        );

        setOldOrderList(updatedOldOrderList);
      }
      handleCancel();
      setQtyChange(0);
    } else {
      //plus qty change
      const newChangeOrder = {
        ...data,
        order_qty: qtyChange,
        order_total_price: data?.price_sale * qtyChange || data?.price_sale,
      };

      setChangeOrderList([newChangeOrder, ...changeOrderList]);
      //check qty change equal
      if (qtyChange === data.order_qty) {
        const updatedList = oldOrderList.filter(
          (item) => item.productId !== data?.productId
        );
        // Update the state with the old list
        setOldOrderList(updatedList);
      } else {
        //todo: update old order
        const updatedOldOrderList = oldOrderList.map((item) =>
          item.productId === data?.productId
            ? {
                ...item,
                order_qty: item.order_qty - qtyChange,
                order_total_price:
                  item?.price_sale * qtyChange > item.order_total_price
                    ? item?.price_sale * qtyChange - item.order_total_price
                    : item.order_total_price - item?.price_sale * qtyChange,
                commission: item.commission,
              }
            : item
        );

        setOldOrderList(updatedOldOrderList);
      }

      handleCancel();
      setQtyChange(0);
    }
  };

  return (
    <div>
      <Modal
        title={
          <>
            <span style={{ color: "gray" }}>ຊື່ລາຍການທີ່ຕ້ອງການປ່ຽນ:</span>{" "}
            {data?.productName}
          </>
        }
        open={isExchange}
        onOk={handleConfirm}
        onCancel={handleCancel}
        cancelText="ປິດອອກ"
        okText="ຢືນຢັນ"
      >
        <p style={{ color: "gray" }}>ປ້ອນຈຳນວນຕ້ອງການປ່ຽນ</p>
        <InputNumber
          size="large"
          min={0}
          autoComplete="off"
          value={qtyChange}
          style={{
            width: "100%",
          }}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value?: string) =>
            value ? parseFloat(value.replace(/(,*)/g, "")) : 0
          }
          onChange={(e) => handleInputChangeOrderQty(e)}
        />
      </Modal>
    </div>
  );
};

export default ChangeOrderList;
