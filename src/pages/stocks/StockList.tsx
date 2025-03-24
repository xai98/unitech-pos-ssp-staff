import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { Spin } from "antd";
import styled from "styled-components";

import TableStock from "./TableStock";
import FilterStock from "./FilterStock";
import ButtonAction from "../../components/ButtonAction";
import { getUserDataFromLCStorage } from "../../utils/helper";
import { GET_BRANCH_STOCKS } from "../../services";
import routes from "../../utils/routes";
import StockMenu from "./StockMenu";

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

// Filter Interface
interface FilterProps {
  skip: number;
  limit: number;
  productName?: string;
}

const StockList: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const branchInfo = getUserDataFromLCStorage();
  const [filter, setFilter] = useState<FilterProps>({ skip: 0, limit: 25 });

  // Fetch stock data
  const {
    loading,
    data: stockData,
    refetch,
  } = useQuery(GET_BRANCH_STOCKS, {
    fetchPolicy: "network-only",
    variables: {
      where: {
        branchId: branchInfo?.branchId?.id || undefined,
        productName: filter?.productName || undefined,
      },
      skip: filter?.skip,
      limit: filter?.limit,
    },
  });

  // Memoized handlers
  const reloadStock = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleRequestStockPage = useCallback(() => {
    navigate(routes.REQUEST_STOCK_PAGE);
  }, [navigate]);

  return (
    <Container>
      <StockMenu />

      <Header>
        <Title>ລາຍການສິນຄ້າຂາຍໜ້າຮ້ານ</Title>
        <ButtonAction
          label="ແຈ້ງຂໍເບິກເຄື່ອງ"
          onClick={handleRequestStockPage}
          htmlType="button"
          type="primary" // ใช้ type="primary" แทน style
          style={{ minWidth: 160 }} // กำหนดความกว้างขั้นต่ำ
        />
      </Header>

      <Spacer />

      {/* Filter */}
      <FilterStock filter={filter} setFilter={setFilter} />

      <Spacer />

      {/* Show data */}
      <StyledSpin size="large" spinning={loading} tip="ກຳລັງໂຫລດຂໍ້ມູນ...">
        <TableStock
          dataList={stockData?.stocks?.data}
          userTotal={stockData?.stocks?.total}
          filter={filter}
          setFilter={setFilter}
          refetch={reloadStock}
        />
      </StyledSpin>
    </Container>
  );
});

export default StockList;
