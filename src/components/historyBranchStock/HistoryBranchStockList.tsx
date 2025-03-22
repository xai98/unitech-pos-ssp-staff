import { Table } from "antd";
import { converStatusHistory, formatDate } from "../../utils/helper";
import { consts } from "../../utils";

interface StockData {
  dataList: any[];
  dataTotal: number;
  filter: any;
  setFilter: (filter: any) => void;
}

const HistoryBranchStockList: React.FC<StockData> = ({
  dataList,
  dataTotal,
  filter,
  setFilter,
}) => {
  const columns = [
    {
      title: "ລຳດັບ",
      dataIndex: "no",
      key: "no",
      width:'65px'
    },
    {
      title: "ຮູບ",
      dataIndex: "image",
      key: "image",
      render: (image: string) => (
        <img
          src={consts.URL_PHOTO_AW3 + image}
          alt="product"
          style={{ width: 60 }}
        />
      ),
    },
    {
      title: "ຊື່ສິນຄ້າ",
      dataIndex: "productName",
      key: "productName",
    },
    {
      title: "ສະຖານະ",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <span style={{ color: status === "IMPORT_STOCK" ? "green" : "red" }}>
          {converStatusHistory(status)}
        </span>
      ),
    },
    {
      title: "ຈຳນວນສິນຄ້າ",
      dataIndex: "oldAmount",
      key: "oldAmount",
    },
    {
      title: "ນຳເຂົ້າ",
      dataIndex: "inAmount",
      key: "inAmount",
    },
    {
      title: "ນຳອອກ",
      dataIndex: "outAmount",
      key: "outAmount",
    },
    {
      title: "ຈຳນວນຍັງເຫຼືອຕົວຈິງ",
      dataIndex: "currentAmount",
      key: "currentAmount",
    },
    {
      title: "ຜູ້ເຮັດລາຍການ",
      dataIndex: "createdBy",
      key: "createdBy",
    },
    {
      title: "ວັນທີ",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt: Date) => <span>{formatDate(createdAt)}</span>,
    },
  ];

  const data =
    dataList &&
    dataList.map((item, index) => ({
    //   no: filter.skip * filter.limit + index + 1,
    no:filter.skip + index + 1,
      ...item,
      image: item?.productId?.image
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
      <p>ລາຍການທັງໝົດ {dataTotal} ລາຍການ</p>
      <Table
        columns={columns}
        dataSource={data}
        rowKey={"no"}
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

export default HistoryBranchStockList;
