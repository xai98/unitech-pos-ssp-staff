import { Table } from "antd";
import { converTypePay, formatDate, formatNumber } from "../../utils/helper";
import { EyeOutlined } from "@ant-design/icons";
import { useState } from "react";
import ViewDetailOrderChange from "./OrderChangeDetail";

interface Props {
  orderList?: any[];
  orderTotal: number;
  filter: any;
  setFilter: (filter: any) => void;
}

interface ViewDetailProp {
  show: boolean;
  data: any;
}

const ReportChangeOrder: React.FC<Props> = ({
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
      title: "ວັນທີປ່ຽນ",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt: Date) => <span>{formatDate(createdAt)}</span>,
    },
    {
      title: "ເລກບິນປ່ຽນ",
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
      title: "ລວມເງິນຮັບເພີ່ມ",
      dataIndex: "amountAddOnNewOrder",
      key: "amountAddOnNewOrder",
      render: (amountAddOnNewOrder: number) => <span>{formatNumber(amountAddOnNewOrder)}</span>,
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
      no:filter.skipChange + index + 1,
      ...item,
    }));

  const handleNextPage = (page: number, pageSize?: number) => {
    setFilter({
      ...filter,
      skipChange: (page - 1) * (pageSize || filter.limitChange),
      limitChange: pageSize || filter.limitChange,
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
          current: filter.skipChange / filter.limitChange + 1,
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

      <ViewDetailOrderChange
        viewDetail={viewDetail}
        onClose = {() => setViewDetail({show:false, data:null})}
      />
    </div>
  );
};

export default ReportChangeOrder;
