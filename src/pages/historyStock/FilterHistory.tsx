import { Col, Input, Row, Select, DatePicker } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useState, useCallback } from "react";
import debounce from "lodash/debounce";
import moment from "moment";

const { Option } = Select;

interface FilterProps {
  from_date?: string;
  to_date?: string;
  limit: number;
  skip: number;
  productName?: string;
  status?: string;
}

interface FilterHistoryProps {
  filter: FilterProps;
  onFilterChange: (filter: Partial<FilterProps>) => void;
}

const FilterHistory: React.FC<FilterHistoryProps> = ({ filter, onFilterChange }) => {
  const [search, setSearch] = useState<string>(filter.productName || "");

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      onFilterChange({ productName: value });
    }, 300),
    [onFilterChange]
  );

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    debouncedSearch(value);
  };

  // Handle status change
  const handleStatusChange = useCallback(
    (value: string) => {
      onFilterChange({ status: value || undefined });
    },
    [onFilterChange]
  );

  // Handle date changes
  const handleDateChange = useCallback(
    (field: "from_date" | "to_date") => (date: moment.Moment | null) => {
      onFilterChange({
        [field]: date ? date.format("YYYY-MM-DD") : undefined,
      });
    },
    [onFilterChange]
  );

  return (
    <div className="filter-container">
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={6}>
          <Input
            size="large"
            placeholder="ຄົ້ນຫາຕາມຊື່ສິນຄ້າ"
            value={search}
            onChange={handleSearchChange}
            prefix={<SearchOutlined />}
            allowClear
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Select
            size="large"
            placeholder="ເບິ່ງຕາມສະຖານະ"
            style={{ width: "100%" }}
            onChange={handleStatusChange}
            value={filter.status}
            allowClear
          >
            <Option value="">ສະແດງທຸກສະຖານະ</Option>
            <Option value="IMPORT_STOCK">ນຳເຂົ້າ</Option>
            <Option value="EXPORT_STOCK">ນຳອອກ</Option>
            {/* <Option value="SALE_STOCK">ຂາຍອອກ</Option> */}
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <DatePicker
            size="large"
            placeholder="ວັນທີ່ເລີ່ມ"
            style={{ width: "100%" }}
            onChange={handleDateChange("from_date")}
            value={filter.from_date ? moment(filter.from_date) : null}
            format="YYYY-MM-DD"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <DatePicker
            size="large"
            placeholder="ວັນທີ່ສິ້ນສຸດ"
            style={{ width: "100%" }}
            onChange={handleDateChange("to_date")}
            value={filter.to_date ? moment(filter.to_date) : null}
            format="YYYY-MM-DD"
          />
        </Col>
      </Row>
    </div>
  );
};

export default FilterHistory;