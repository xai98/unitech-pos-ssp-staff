import { Button, Flex, Popconfirm, Tag } from "antd";
import { CloseOutlined } from "@ant-design/icons"; // นำเข้าไอคอน CloseOutlined

const OrderBillSection: React.FC<{
  orders: { id: string; items: any[] }[];
  currentOrderId: string;
  addNewOrderBill: () => void;
  switchOrder: (orderId: string) => void;
  deleteOrder: (orderId: string) => void;
}> = ({ orders, currentOrderId, addNewOrderBill, switchOrder, deleteOrder }) => {
  return (
    <div style={{  background: "#f5f5f5", borderRadius: 8,paddingTop:10 }}>
      <Flex gap={5} wrap>
      <Button 
        type="primary"
        onClick={addNewOrderBill}
        style={{
          marginBottom: 10,
          background: "#4CAF50", // สีเขียวสดใส
          borderColor: "#4CAF50",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          transition: "all 0.3s ease",
        }}
        size="middle"
      >
        ເພີ່ມບິນໃໝ່
      </Button>

        {orders.map((order,index) => (
          <div key={order.id}>
            <Button
              onClick={() => switchOrder(order.id)}
              style={{
                marginRight: 8,
                background: currentOrderId === order.id ? "#1976d2" : "#f0f0f0",
                color: currentOrderId === order.id ? "#fff" : "#000",
                border: "none",
                boxShadow: currentOrderId === order.id ? "0 2px 4px rgba(25, 118, 210, 0.3)" : "none",
                transition: "all 0.3s ease",
                padding: "4px 10px",
                borderRadius: 4,
              }}
            >
              ບິນ {index + 1} <Tag
              color={order.items.length > 0 ? "blue" : "default"}
              style={{ marginRight: 8, fontSize: 12 }}
            >
              {order.items.length}
            </Tag>
            </Button>
            <Popconfirm
              title="ເຈົ້າແນ່ໃຈລະ ຫຼື ບໍ່ທີ່ຈ້ອງການລຶບບິນນີ້?"
              onConfirm={() => deleteOrder(order.id)}
              okText="ລືບ"
              cancelText="ບໍ່ລຶບ"
              placement="bottomRight"
            >
              <Button
                danger
                size="small"
                icon={<CloseOutlined />}
                style={{
                  borderRadius: 4,
                  boxShadow: "0 2px 4px rgba(255, 77, 79, 0.2)",
                  transition: "all 0.3s ease",
                  padding: 4, // ปรับขนาด Padding ให้เหมาะสมกับไอคอน
                }}
              />
            </Popconfirm>
            
          </div>
        ))}

      </Flex>



    </div>
  );
};

export default OrderBillSection;