import React from "react";
import { context } from "../../../hooks/Context";
import { SearchOutlined } from "@ant-design/icons";
import { Input } from "antd";

interface Props {
  filter: any;
  setFilter: (filter: any) => void;
}

const FilterCategory: React.FC<Props> = ({ filter, setFilter }) => {
  const { categoryData } = context();
  return (
    <div>
      <Input
        size="large"
        style={{ width: "100%" }}
        placeholder="ຄົ້ນຫາຕາມຊື່ສິນຄ້າ...."
        value={filter?.productName}
        onChange={(e) =>
          setFilter({
            ...filter,
            productName: e.target.value || "",
          })
        }
        prefix={<SearchOutlined />}
      />
      <div className="scrollable-container">
        <div
          className={`scrollable-item ${
            filter?.categoryId === "ALL" ? "scrollable-active" : ""
          }`}
          onClick={() =>
            setFilter({
              ...filter,
              categoryId: "ALL",
            })
          }
        >
          ສະແດງທັງໝົດ
        </div>
        {categoryData?.map((item: any, index: number) => (
          <div
            key={index}
            className={`scrollable-item ${
              item?.id === filter?.categoryId ? "scrollable-active" : ""
            } `}
            onClick={() =>
              setFilter({
                ...filter,
                categoryId: item?.id,
              })
            }
          >
            {item?.categoryName}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterCategory;
