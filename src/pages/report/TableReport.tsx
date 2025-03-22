import { Table } from "antd";
import { converTypePay, formatDate, formatNumber } from "../../utils/helper";
import { EyeOutlined } from "@ant-design/icons";
import { useState } from "react";
import ViewDetailOrder from "./OrderDetail";

interface StockData {
  orderList: any[];
  orderTotal: number;
  filter: any;
  setFilter: (filter: any) => void;
}

interface ViewDetailProp {
  show: boolean;
  data: any;
}

const TableReport: React.FC<StockData> = ({
  orderList,
  orderTotal,
  filter,
  setFilter,
}) => {
  const [viewDetail, setViewDetail] = useState<ViewDetailProp>({
    show: false,
    data: null,
  });

  const handleViewDetail = (data: any) => {
    setViewDetail({
      show: true,
      data,
    });
  };

  const columns = [
    {
      title: "ລດ",
      dataIndex: "no",
      key: "no",
      render: (no: number) => <span>{no}</span>,
      width:"50px"
    },

    {
      title: "ວັນທີຂາຍ",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt: Date) => <span>{formatDate(createdAt)}</span>,
    },
    {
      title: "ເລກບິນ",
      dataIndex: "order_no",
      key: "order_no",
      render: (order_no: string, record: any) => (
        <a onClick={() => handleViewDetail(record)}>
          <EyeOutlined /> {order_no}
        </a>
      ),
    },
    {
      title: "ປະເພດຊຳລະ",
      dataIndex: "typePay",
      key: "typePay",
      render: (typePay: string) => <span>{converTypePay(typePay)}</span>,
    },

    {
      title: "ລວມເງິນ",
      dataIndex: "total_price",
      key: "total_price",
      render: (total_price: number) => <span>{formatNumber(total_price)}</span>,
    },
    {
      title: "ສ່ວນຫຼຸດ",
      dataIndex: "discount_total",
      key: "discount_total",
      render: (discount_total: number) => (
        <span>{formatNumber(discount_total)}</span>
      ),
    },
    {
      title: "ຮັບເງິນຕົວຈິງ",
      dataIndex: "final_receipt_total",
      key: "final_receipt_total",
      render: (final_receipt_total: number) => (
        <span>{formatNumber(final_receipt_total)}</span>
      ),
    },
    {
      title: "ເງິນທອນ",
      dataIndex: "send_back_customer",
      key: "send_back_customer",
      render: (send_back_customer: number) => (
        <span>{formatNumber(send_back_customer)}</span>
      ),
    },
  ];

  const data =
    orderList &&
    orderList.map((item, index) => ({
      index,
      no:filter.skip + index + 1,
      ...item,
    }));

  const handleNextPage = (page: number, pageSize?: number) => {
    setFilter({
      ...filter,
      skip: (page - 1) * (pageSize || filter.limit),
      limit: pageSize || filter.limit,
    });
  };

  return (
    <div>
      <p>ລາຍການທັງໝົດ {orderTotal} ລາຍການ</p>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={{
          current: filter.skip / filter.limit + 1,
          total: orderTotal,
          pageSize: filter.limit,
          onChange: handleNextPage,
          showSizeChanger: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} ລາຍການ`,
        }}
        sticky={{
          offsetHeader: 60,
        }}
      />

      <ViewDetailOrder
        viewDetail={viewDetail}
        onClose = {() => setViewDetail({show:false, data:null})}
      />
    </div>
  );
};

export default TableReport;
