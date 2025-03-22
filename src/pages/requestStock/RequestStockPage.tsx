import styles from "../../styles/User.module.css";
import { useState } from "react";
import {
  addOneDate,
  convertStatusRequestStock,
  getUserDataFromLCStorage,
  requestStatus,
} from "../../utils/helper";
import { useQuery } from "@apollo/client";
import { GET_REQUEST_STOCKS } from "../../services";
import { Button, Col, DatePicker, Flex, Form, Row, Spin } from "antd";
import RequestList from "./RequestList";
// import TableHistory from "./TableHistory";
// import FilterHistory from "./FilterHistory";

import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";
import { BoxContainer } from "../../components/stylesComponent/otherComponent";
import ButtonAction from "../../components/ButtonAction";
import routes from "../../utils/routes";
import { useNavigate } from "react-router-dom";

dayjs.extend(localeData);
const { RangePicker } = DatePicker;

interface FilterProps {
  from_date?: string;
  to_date?: string;
  limit: number;
  skip: number;
  productName?: string;
  status?: string;
}

const RequestStockPage: React.FC = () => {
  const navigate = useNavigate();
  const branchInfo = getUserDataFromLCStorage();
  const [filter, setFilter] = useState<FilterProps>({
    status: "all",
    from_date: "",
    to_date: "",
    skip: 0,
    limit: 25,
  });
  // Get stocks with useFetchData hook
  const { loading, data: requestStockData } = useQuery(GET_REQUEST_STOCKS, {
    fetchPolicy: "network-only",
    variables: {
      where: {
        branchId: branchInfo?.branchId?.id || undefined,
        from_date: filter?.from_date ? filter?.from_date : undefined,
        to_date: filter?.to_date ? addOneDate(filter?.to_date) : undefined,
        status: filter?.status !== "all" ? filter?.status : undefined,
      },
      skip: filter?.skip,
      limit: filter?.limit,
      orderBy: "createdAt_DESC",
    },
  });

  const handleDateChange = (_: any, dateStrings: [string, string]) => {
    // ตรวจสอบว่า dateStrings ไม่ใช่ค่าว่าง
    if (dateStrings && dateStrings[0] && dateStrings[1]) {
      setFilter({
        ...filter,
        from_date: dateStrings[0],
        to_date: dateStrings[1],
      });
    } else {
      // ตั้งค่าให้วันที่เป็นว่างเมื่อไม่เลือกวันที่
      setFilter({
        ...filter,
        from_date: "",
        to_date: "",
      });
    }
  };

  const handleRequestStockPage = () => navigate(routes.REQUEST_STOCK_PAGE);

  return (
    <div style={{ margin: "10px" }}>
      <BoxContainer>
        <div className={styles.headerTitle}>
          <h2>ປະຫວັດການແຈ້ງເບິກສະຕ໋ອກ</h2>
          <ButtonAction
            label="ແຈ້ງຂໍເບີກເຄື່ອງ"
            onClick={handleRequestStockPage}
            htmlType="button"
            type="text"
            style={{ backgroundColor: "#1976d2", color: "#fff" }}
          />
        </div>

        <Row gutter={[10, 10]}>
          <Col xs={24} sm={12} md={8} lg={8} xl={6}>
            <Form.Item layout="vertical" label="ເບິ່ງຕາມວັນທີສັ່ງ">
              <RangePicker
                size="large"
                style={{ width: "100%" }}
                onChange={handleDateChange}
                placeholder={["ແຕ່ວັນທີ", "ຫາວັນທີ"]}
                format="YYYY-MM-DD"
                value={[
                  filter.from_date ? dayjs(filter.from_date) : null,
                  filter.to_date ? dayjs(filter.to_date) : null,
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Flex gap="small" wrap>
          <Button
            type={filter?.status === "all" ? "primary" : "dashed"}
            onClick={() => setFilter({ ...filter, status: "all" })}
          >
            ສະແດງທັງໝົດ
          </Button>

          {requestStatus?.map((status) => (
            <Button
              key={status}
              type={filter?.status === status ? "primary" : "dashed"}
              onClick={() => setFilter({ ...filter, status: status })}
            >
              {convertStatusRequestStock(status)}
            </Button>
          ))}
        </Flex>
        <div style={{ height: 15 }}></div>

        {/* Show data */}
        <Spin size="large" spinning={loading} tip="ກຳລັງໂຫລດຂໍ້ມູນ...">
          <RequestList
            dataList={requestStockData?.requestStocks?.data}
            dataTotal={requestStockData?.requestStocks?.total}
            filter={filter}
            setFilter={setFilter}
          />
        </Spin>
      </BoxContainer>
    </div>
  );
};

export default RequestStockPage;
