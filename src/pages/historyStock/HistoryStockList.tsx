import styles from "../../styles/User.module.css";
import { useState, useMemo, useCallback } from "react";
import {
  addOneDate,
  currentDate,
  getUserDataFromLCStorage,
} from "../../utils/helper";
import { useQuery } from "@apollo/client";
import { HISTORY_STOCKS } from "../../services";
import { Spin, Card, Space } from "antd";
import TableHistory from "./TableHistory";
import FilterHistory from "./FilterHistory";
import HistoryMenu from "./HistoryMenu";
import styled from "styled-components";


// Styled Components
const Container = styled.div`
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;


interface FilterProps {
  from_date?: string;
  to_date?: string;
  limit: number;
  skip: number;
  productName?: string;
  status?: string;
}

const HistoryStockList: React.FC = () => {
  // Memoize branchInfo to prevent unnecessary recalculations
  const branchInfo = useMemo(() => getUserDataFromLCStorage(), []);

  // Initialize filter with default values
  const [filter, setFilter] = useState<FilterProps>(() => ({
    from_date: currentDate().startDate,
    to_date: currentDate().endDate,
    skip: 0,
    limit: 25,
  }));

  // Memoize query variables
  const queryVariables = useMemo(() => ({
    where: {
      branchId: branchInfo?.branchId?.id,
      productName: filter.productName,
      status: filter.status,
      from_date: filter.from_date,
      to_date: filter.to_date ? addOneDate(filter.to_date) : undefined,
    },
    skip: filter.skip,
    limit: filter.limit,
  }), [branchInfo, filter]);

  // Apollo query with optimization
  const { loading, data: historyStockData } = useQuery(HISTORY_STOCKS, {
    fetchPolicy: "cache-and-network",
    variables: queryVariables,
    notifyOnNetworkStatusChange: true,
    skip: !branchInfo?.branchId?.id, // Skip query if no branchId
  });

  // Callback for filter updates
  const handleFilterChange = useCallback((newFilter: Partial<FilterProps>) => {
    setFilter(prev => ({ ...prev, ...newFilter, skip: 0 }));
  }, []);

  // Memoize table data
  const tableData = useMemo(() => ({
    dataList: historyStockData?.historystocks?.data || [],
    total: historyStockData?.historystocks?.total || 0,
  }), [historyStockData]);

  return (
    <Container>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <HistoryMenu />

        <Card
          title="ປະຫວັດນຳເຂົ້າ, ນຳອອກ ແລະ ຂາຍອອກ ໜ້າຮ້ານ"
          className={styles.cardHeader}
          style={{ background: '#f5f5f5', fontSize: '18px' }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <FilterHistory 
              filter={filter} 
              onFilterChange={handleFilterChange}
            />

            <Spin 
              size="large" 
              spinning={loading} 
              tip="ກຳລັງໂຫລດຂໍ້ມູນ..."
            >
              <TableHistory
                dataList={tableData.dataList}
                dataTotal={tableData.total}
                filter={filter}
                setFilter={handleFilterChange}
              />
            </Spin>
          </Space>
        </Card>
      </Space>
    </Container>
  );
};

export default HistoryStockList;