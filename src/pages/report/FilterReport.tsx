import { Col, Input, Row } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useState } from "react";

interface FilterReport {
  filter: any;
  setFilter: (filter: any) => void;
}

const FilterReport: React.FC<FilterReport> = ({ filter, setFilter }) => {
  const [search, setSearch] = useState<string>("");

  const handleSearch = () => {
    // Perform your search or filter logic here
    setFilter({
      ...filter,
      order_no: search || "",
    });
  };

  return (
    <div>
      <Row gutter={10}>
        <Col span="5">
          <Input
            size="large"
            placeholder="ຄົ້ນຫາຕາມເລກທີ່ບິນ...."
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            onPressEnter={handleSearch}
            prefix={<SearchOutlined />}
          />
        </Col>
        <Col span="5">
          <Input
           type="date"
            size="large"
            placeholder="ວັນທີ...."
            onChange={(e) => {
              setFilter({...filter, from_date: e.target.value || ""});
            }}
            value={filter?.from_date || ''}
            prefix={<SearchOutlined />}
          />
        </Col>
        <Col span="5">
          <Input
            type="date"
            size="large"
            placeholder="ຫາວັນທີ...."
            onChange={(e) => {
              setFilter({...filter, to_date: e.target.value || ""});
            }}
            value={filter?.to_date || ''}
            prefix={<SearchOutlined />}
          />
        </Col>
      </Row>
    </div>
  );
};

export default FilterReport;
