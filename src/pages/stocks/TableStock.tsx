import React, { useCallback } from "react";
import { Table } from "antd";
// import { useMutation } from "@apollo/client";
import styled from "styled-components";

import { formatNumber } from "../../utils/helper";
import { consts } from "../../utils";
// import { UPDATE_STOCK_SHOW } from "../../services";

// Styled Components
const Container = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const TotalText = styled.div`
  font-size: 14px;
  color: #595959;
`;

// const InstructionText = styled.div`
//   font-size: 13px;
//   color: #595959;
//   margin-bottom: 12px;
  
//   span {
//     font-weight: bold;
//     color: #1a1a1a;
//   }
// `;

const StyledTable = styled(Table)`
  .ant-table-thead > tr > th {
    background: #fafafa;
    font-weight: 600;
    color: #1a1a1a;
  }
  .ant-table-tbody > tr:hover > td {
    background: #f5f5f5;
  }
`;

const ProductImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
`;

// Interfaces
// interface ProductData {
//   productName?: string;
//   id?: string;
// }

// interface RecordUpdate {
//   data: ProductData | null;
//   noShow: number;
// }

interface StockData {
  dataList: any[];
  userTotal: number;
  filter: any;
  setFilter: (filter: any) => void;
  refetch: () => void;
}

const TableStock: React.FC<StockData> = React.memo(
  ({ dataList, userTotal, filter, setFilter }) => {
    // const [updateStock] = useMutation(UPDATE_STOCK_SHOW);
    // const [recordUpdate, setRecordUpdate] = useState<RecordUpdate>({
    //   data: null,
    //   noShow: 0,
    // });

    // Define updateShow first
    // const updateShow = useCallback(async () => {
    //   try {
    //     await updateStock({
    //       variables: {
    //         data: { noShow: recordUpdate?.noShow },
    //         where: { id: recordUpdate?.data?.id },
    //       },
    //     });
    //     setRecordUpdate({ noShow: 0, data: null });
    //     message.success("ຈັດລຳດັບສະແດງສຳເລັດ");
    //     refetch();
    //   } catch (error) {
    //     message.error("ການອັບເດດລຳດັບສະແດງລົ້ມເຫຼວ");
    //   }
    // }, [recordUpdate, updateStock, refetch]);

    // Then use it in handleUpdateShow
    // const handleUpdateShow = useCallback(() => {
    //   Modal.confirm({
    //     title: "ຢືນຢັນການແກ້ໄຂຂໍ້ມູນ",
    //     content: (
    //       <div>
    //         ທ່ານຕ້ອງການຈັດລຳດັບສະແດງ{" "}
    //         <span style={{ color: "red" }}>
    //           {recordUpdate?.data?.productName || "ກະລຸນາປ້ອນຂໍ້ມູນກ່ອນ"}
    //         </span>{" "}
    //         ນີ້ແທ້ ຫຼື ບໍ່?
    //       </div>
    //     ),
    //     okText: "ຢືນຢັນ",
    //     cancelText: "ປິດອອກ",
    //     okType: "primary",
    //     onOk: updateShow, // เรียกใช้ updateShow ที่กำหนดไว้ก่อนหน้า
    //   });
    // }, [recordUpdate, updateShow]); // เพิ่ม updateShow เป็น dependency

    const handleNextPage = useCallback(
      (page: number, pageSize?: number) => {
        setFilter({
          ...filter,
          skip: (page - 1) * (pageSize || filter.limit),
          limit: pageSize || filter.limit,
        });
      },
      [filter, setFilter]
    );

    const columns = [
      {
        title: "ລຳດັບ",
        dataIndex: "no",
        key: "no",
        width: 80,
      },
      // {
      //   title: "ລຳດັບສະແດງ",
      //   dataIndex: "noShow",
      //   key: "noShow",
      //   width: 120,
      //   render: (noShow: number, record: any) => (
      //     <InputNumber
      //       min={0}
      //       value={recordUpdate.data?.id === record.id ? recordUpdate.noShow : noShow}
      //       onChange={(value: number | null) =>
      //         setRecordUpdate({
      //           noShow: value || 0,
      //           data: record,
      //         })
      //       }
      //       onPressEnter={handleUpdateShow}
      //       style={{ width: "100%" }}
      //     />
      //   ),
      // },
      {
        title: "ຮູບ",
        dataIndex: "image",
        key: "image",
        width: 100,
        render: (image: string) => (
          <ProductImage src={consts.URL_PHOTO_AW3 + image} alt="product" />
        ),
      },
      {
        title: "ຊື່ສິນຄ້າ",
        dataIndex: "productName",
        key: "productName",
        width: 200,
      },
      {
        title: "ປະເພດ",
        dataIndex: "categoryName",
        key: "categoryName",
        width: 150,
      },
      {
        title: "ຈຳນວນ",
        dataIndex: "amount",
        key: "amount",
        width: 100,
      },
      {
        title: "ລາຄາຂາຍ",
        dataIndex: "price_sale",
        key: "price_sale",
        width: 120,
      },
    ];

    const data = dataList?.map((item, index) => ({
      index,
      no: filter.skip + index + 1,
      id: item.id,
      noShow: item.noShow,
      productName: item.productName,
      image: item.productId.image,
      categoryName: item.categoryId.categoryName,
      amount: formatNumber(item.amount),
      price_sale: formatNumber(item.productId.price_sale),
    }));

    return (
      <Container>
        <Header>
          <TotalText>ລາຍການທັງໝົດ {userTotal} ລາຍການ</TotalText>
        </Header>

        {/* <InstructionText>
          <span>ວິທີຈັດລຽງສະແດງ:</span> ໃຫ້ປ່ຽນເລກໃນບ໋ອກທີ່ສະແດງ ແລະ ກົດ Enter ເພື່ອຢືນຢັນ
        </InstructionText> */}

        <StyledTable
          columns={columns}
          dataSource={data}
          rowKey="id"
          pagination={{
            current: filter.skip / filter.limit + 1,
            total: userTotal,
            pageSize: filter.limit,
            onChange: handleNextPage,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} ລາຍການ`,
          }}
          sticky={{ offsetHeader: 0 }}
          scroll={{ x: "max-content" }}
        />
      </Container>
    );
  }
);

export default TableStock;