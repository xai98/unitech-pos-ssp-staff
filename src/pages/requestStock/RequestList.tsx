import { Table } from "antd";
import {
  convertStatus,
  formatDate,
} from "../../utils/helper";
import { useNavigate } from "react-router-dom";
import routes from "../../utils/routes";

interface StockData {
  dataList: any[];
  dataTotal: number;
  filter: any;
  setFilter: (filter: any) => void;
}

const RequestList: React.FC<StockData> = ({
  dataList,
  dataTotal,
  filter,
  setFilter,
}) => {
  
    const navigate = useNavigate();




  const columns = [
    {
      title: "ລຳດັບ",
      dataIndex: "no",
      key: "no",
      width: "65px",
    },
    {
      title: "ວັນທີແຈ້ງຂໍ",
      dataIndex: "createdAt",
      key: "createdAt",
      width: "200px",
      render: (createdAt: Date) => <span>{formatDate(createdAt)}</span>,
    },
    {
      title: "ຊື່ຜູ້ແຈ້ງຂໍ",
      dataIndex: "requestBy",
      key: "requestBy",
    },
    {
      title: "ຈຳນວນລາຍການຂໍ",
      dataIndex: "items",
      key: "items",
      render: (items: any[]) => (
        <div style={{ textAlign: "left" }}>{items?.length} ລາຍການ</div>
      ),
    },
    {
      title: "ສະຖານະ",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <div>{convertStatus(status)}</div>,
    },
    {
      title: "ຜູ້ອະນຸມັດ",
      dataIndex: "approvedBy",
      key: "approvedBy",
    },
    {
      title: "ວັນທີທີອະນຸມັດ",
      dataIndex: "dateApproved",
      key: "dateApproved",
      render: (dateApproved: Date) => <span>{dateApproved ? formatDate(dateApproved) : '-'}</span>,
    },
  ];

  const data =
    dataList &&
    dataList.map((item, index) => ({
      //   no: filter.skip * filter.limit + index + 1,
      no: filter.skip + index + 1,
      ...item,
      image: item?.productId?.image,
    }));

  const handleNextPage = (page: number, pageSize?: number) => {
    setFilter({
      ...filter,
      skip: (page - 1) * (pageSize || filter.limit),
      limit: pageSize || filter.limit,
    });
  };

  const handleViewDetail = (record: any) => {
    navigate(routes.HISTORY_REQUEST_STOCK_DETAIL + '/' + record.id)
  }

  return (
    <div>
      <p>ລາຍການທັງໝົດ {dataTotal} ລາຍການ</p>
      <Table
        columns={columns}
        dataSource={data}
        rowKey={"no"}
        onRow={(record) => ({
            onClick: () => handleViewDetail(record), // Trigger handleViewDetail when the row is clicked
          })}
        pagination={{
          current: filter.skip / filter.limit + 1,
          total: dataTotal,
          pageSize: filter.limit,
          onChange: handleNextPage,
          showSizeChanger: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} ລາຍການ`,
        }}
        sticky={{
          offsetHeader: 0,
        }}
      />
    </div>
  );
};

export default RequestList;
