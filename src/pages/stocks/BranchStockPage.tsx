import React, { useCallback, useState } from "react";
import { useQuery } from "@apollo/client";
import { Button, Spin } from "antd";
import styled from "styled-components";

import FilterStock from "./FilterStock";
import { getUserDataFromLCStorage } from "../../utils/helper";
import { GET_BRANCH_STOCK_BACK_LISTS } from "../../services";
import StockMenu from "./StockMenu";
import BranchStockList from "../../components/branchStock/BranchStockList";
import { BsUpcScan } from "react-icons/bs";
import ScanImportBranchStock from "../../components/branchStock/ScanImportBranchStock";

// Styled Components
const Container = styled.div`
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 20px;
  color: #1a1a1a;
`;

const Spacer = styled.div<{ height?: number }>`
  height: ${({ height }) => height || 16}px;
`;

const StyledSpin = styled(Spin)`
  width: 100%;
  .ant-spin-dot-item {
    background-color: #1976d2;
  }
`;

const StyledButton = styled(Button)`
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 16px;
  height: auto;
  &:hover,
  &:focus {
    background-color: #115293;
    color: white;
  }
`;

// Filter Interface
interface FilterProps {
  skip: number;
  limit: number;
  productName?: string;
  barcode?: string;
}

const BranchStockPage: React.FC = React.memo(() => {
  const branchInfo = getUserDataFromLCStorage();
  const [filter, setFilter] = useState<FilterProps>({ skip: 0, limit: 25 });

  const [isScanImport, setIsScanImport] = useState(false);

  // Fetch stock data
  const {
    loading,
    data: stockData,
    refetch,
  } = useQuery(GET_BRANCH_STOCK_BACK_LISTS, {
    fetchPolicy: "network-only",
    variables: {
      where: {
        branchId: branchInfo?.branchId?.id || undefined,
        productName: filter?.productName || undefined,
        barcode: filter?.barcode || undefined,
      },
      skip: filter?.skip,
      limit: filter?.limit,
    },
  });

  // Memoized handlers
  const reloadStock = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleOpenFormScanImport = () => {
    setIsScanImport(true);
  };

  const handleCloseFormScanImport = useCallback(() => {
    setIsScanImport(false);
  }, []); // ไม่มี dependency เพราะ setIsScanImport stable

  return (
    <Container>
      <StockMenu />

      <Header>
        <Title>ລາຍການສະຕ໋ອກຫຼັງບ້ານ</Title>

        <StyledButton onClick={handleOpenFormScanImport}>
          <BsUpcScan /> ສະແກນຮັບເຄື່ອງເຂົ້າສະຕ໋ອກ
        </StyledButton>
      </Header>

      <Spacer />

      {/* Filter */}
      <FilterStock filter={filter} setFilter={setFilter} />

      <Spacer />

      {/* Show data */}
      <StyledSpin size="large" spinning={loading} tip="ກຳລັງໂຫລດຂໍ້ມູນ...">
        <BranchStockList
          dataList={stockData?.branchStocks?.data}
          userTotal={stockData?.branchStocks?.total}
          filter={filter}
          setFilter={setFilter}
          refetch={reloadStock}
        />
      </StyledSpin>

      <ScanImportBranchStock
        open={isScanImport}
        handleCancel={handleCloseFormScanImport}
        refetch={reloadStock}
      />
    </Container>
  );
});

export default BranchStockPage;
