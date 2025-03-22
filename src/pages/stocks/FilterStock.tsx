import { Col, Input, Row } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useCallback, useState } from "react";
import { BsUpcScan } from "react-icons/bs";

// Define a more specific type for filter
// interface FilterType {
//   productName?: string;
//   barcode?: string;
//   [key: string]: any; // Allow additional fields if needed
// }

interface FilterData {
  filter: any;
  setFilter: (filter: any) => void;
}

const FilterStock: React.FC<FilterData> = ({ filter, setFilter }) => {
  const [search, setSearch] = useState<string>("");
  const [searchBarcode, setSearchBarcode] = useState<string>("");


  const handleSearch = useCallback(() => {
    setFilter({
      ...filter,
      productName: search || "",
      barcode: searchBarcode || "",
    });
  }, [search, searchBarcode, setFilter, filter]);

  // Optional: Real-time search on change
  const handleInputChange = useCallback(
    (type: "productName" | "barcode", value: string) => {
      if (type === "productName") setSearch(value);
      if (type === "barcode") setSearchBarcode(value);
      // Uncomment below for real-time search
      // handleSearch();
    },
    [handleSearch] // ถ้าใช้ real-time search ให้ใส่ handleSearch ที่นี่
  );

  return (
    <div>
      <Row gutter={10}>
        <Col span={8}>
          <Input
            size="large"
            placeholder="ຄົ້ນຫາຕາມຊື່ສິນຄ້າ...."
            value={search} // Bind value to state
            onChange={(e) => handleInputChange("productName", e.target.value)}
            onPressEnter={handleSearch}
            prefix={<SearchOutlined />}
            allowClear
          />
        </Col>

        <Col span={8}>
          <Input
            size="large"
            placeholder="ສະແກນເພື່ອຄົ້ນຫາແລ້ວ Enter...."
            value={searchBarcode} // Bind value to state
            onChange={(e) => handleInputChange("barcode", e.target.value)}
            onPressEnter={handleSearch}
            prefix={<BsUpcScan />}
            allowClear
          />
        </Col>
      </Row>
    </div>
  );
};

export default FilterStock;