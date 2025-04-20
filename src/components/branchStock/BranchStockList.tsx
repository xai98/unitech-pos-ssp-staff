import React, { useCallback, useMemo, useState } from "react";
import { InputNumber, message, Table, TableProps } from "antd";
import { useMutation } from "@apollo/client";
import styled from "styled-components";
import { TbPackageExport } from "react-icons/tb";
import { formatNumber } from "../../utils/helper";
import { consts } from "../../utils";
import { StyledButton } from "../../styles/GlobalStyle";
import { ColumnsType } from "antd/es/table";
import { EXPORT_BRANCH_STOCK_ONE } from "../../services";

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

const InstructionText = styled.div`
  font-size: 13px;
  color: #595959;
  margin-bottom: 12px;

  span {
    font-weight: bold;
    color: #1a1a1a;
  }
`;

const StyledTable = styled(Table)<TableProps<StockItem>>`
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

const ExpandedContent = styled.div`
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
`;

// Interfaces
interface StockItem {
  id: string;
  productName: string;
  image: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  price_sale: number;
  noShow?: string;
  no?: number;
}

interface FilterType {
  skip: number;
  limit: number;
  [key: string]: any;
}

interface StockData {
  dataList: any[];
  userTotal: number;
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  refetch: () => void;
}

const BranchStockList: React.FC<StockData> = React.memo(
  ({ dataList, userTotal, filter, setFilter, refetch }) => {
    const [exportAmounts, setExportAmounts] = useState<
      Record<string, number>
    >({});

    const [exportBranchStock, { loading: exportLoading }] = useMutation(
      EXPORT_BRANCH_STOCK_ONE,
      {
        onCompleted: (data) => {
          message.success(
            `ເພີ່ມສະຕ໋ອກ ${data?.exportBranchStockOne?.productName} ສຳເລັດ`
          );
          refetch();
        },
        onError: (error) => message.warning(error.message),
      }
    );

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

    const columns: ColumnsType<StockItem> = [
      {
        title: "ລຳດັບ",
        dataIndex: "no",
        key: "no",
        width: 80,
      },
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

    const data: any[] = useMemo(() => {
      if (!dataList || !Array.isArray(dataList)) {
        return [];
      }
      
      return dataList.map((item, index) => ({
        id: item.id || '',
        no: filter.skip + index + 1,
        noShow: item.noShow,
        productName: item?.productName || '',
        image: item?.productId?.image || '',
        categoryId: item?.categoryId?.id || '',
        categoryName: item?.categoryId?.categoryName || '',
        amount: Number(formatNumber(item.amount || 0)),
        price_sale: formatNumber(item?.productId?.price_sale || 0),
      }));
    }, [dataList, filter.skip]);

    const handleExportStock = useCallback(
      async (record: StockItem) => {
        const amount = exportAmounts[record.id] || 0;
        if (amount <= 0) {
          message.warning("ກະລຸນາປ້ອນຈຳນວນທີ່ຕ້ອງການນຳອອກ");
          return;
        }

        try {
          await exportBranchStock({
            variables: {
              data: {
                categoryId: record.categoryId,
                productId: record.id,  // Added missing productId
                amount,
              },
              where: { id: record.id },
            },
          });
        } catch (error) {
          console.error("Export error:", error);
        } finally {
          setExportAmounts((prev) => ({ ...prev, [record.id]: 0 }));
        }
      },
      [exportAmounts, exportBranchStock]
    );

    const expandedRowRender = useCallback(
      (record: StockItem) => (
        <ExpandedContent>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "120px 1fr",
              gap: 8,
            }}
          >
            <strong>ປ້ອນຈຳນວນອອກຂາຍ:</strong>
            <div>
              <InputNumber
                min={0}
                value={exportAmounts[record.id] || 0}
                onChange={(value) => {
                  const exportValue = value !== null ? value : 0;
                  if (exportValue > record.amount) {
                    message.warning(
                      `ທ່ານປ້ອນຈຳນວນນຳອອກກາຍສະຕ໋ອກທີ່ມີຈິງ ${
                    record.amount
                      } ໂຕ`
                    );
                    return;
                  }
                  setExportAmounts((prev) => ({
                    ...prev,
                    [record.id]: exportValue,
                  }));
                }}
                onPressEnter={() => handleExportStock(record)}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => Number(value?.replace(/\$\s?|(,*)/g, "") || 0)}
                style={{ width: 300, marginBottom: 20 }}
              />
              <StyledButton
                block
                size="middle"
                onClick={() => handleExportStock(record)}
                style={{ width: 300 }}
                color="green"
                disabled={(exportAmounts[record.id] || 0) === 0 || exportLoading}
                loading={exportLoading}
              >
                <TbPackageExport /> ຢືນຢັນນຳອອກ
              </StyledButton>
            </div>
          </div>
        </ExpandedContent>
      ),
      [exportAmounts, handleExportStock, exportLoading]
    );

    return (
      <Container>
        <Header>
          <TotalText>ລາຍການທັງໝົດ {userTotal} ລາຍການ</TotalText>
        </Header>
        <InstructionText>
          <span>ວິທີການນຳເອົາເຄື່ອງຂື້ນຂາຍ:</span> ກົດທີ່ເຄື່ອງໝາຍບວກ ຫຼັງຈາກນັ້ນໃຫ້ ປ້ອນຈຳນວນຕ້ອງການນຳອອກຂາຍ.
        </InstructionText>
        <StyledTable
          columns={columns}
          dataSource={data}
          rowKey="id"
          expandable={{ expandedRowRender }}
          pagination={{
            current: Math.floor(filter.skip / filter.limit) + 1,
            total: userTotal,
            pageSize: filter.limit,
            onChange: handleNextPage,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} ລາຍການ`,
          }}
          sticky={{ offsetHeader: 0 }}
          scroll={{ x: "max-content" }}
        />
      </Container>
    );
  }
);

export default BranchStockList;