import React from "react";
import { Tabs } from "antd";
import { MdHistoryEdu } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import routes from "../../utils/routes";
import { FaHistory } from "react-icons/fa";

const StyledTabs = styled(Tabs)`
  .ant-tabs-tab-active .ant-tabs-tab-btn {
    color: #1976d2;
    font-weight: 600;
  }
  .ant-tabs-ink-bar {
    background: #1976d2;
  }
`;

// Define menu items with paths
const items = [
  {
    key: "1",
    label: "ປະຫວັດການຂາຍ",
    icon: <FaHistory />,
    path: routes.HISTORY_STOCK_LIST, // กำหนด path ที่เกี่ยวข้อง

  },
  {
    key: "2",
    label: "ປະຫວັດສະຕ໋ອກສິນຄ້າ",
    icon: <MdHistoryEdu />,
    path: routes.HISTORY_BRANCH_STOCK_LIST, // กำหนด path ที่เกี่ยวข้อง
  },
];

const HistoryMenu: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active key based on current path
  const getActiveKey = () => {
    const currentPath = location.pathname;
    const activeItem = items.find((item) => currentPath.startsWith(item.path));
    return activeItem ? activeItem.key : "1"; // Default to "1" if no match
  };


  const handleTabChange = (key: string) => {
    const selectedItem = items.find((item) => item.key === key);
    if (selectedItem?.path) {
      navigate(selectedItem.path);
    }
  };


  return (
    <StyledTabs
      activeKey={getActiveKey()} // ใช้ activeKey แทน defaultActiveKey
      onChange={handleTabChange}
      items={items.map((menu) => ({
        key: menu.key,
        label: menu.label,
        icon: menu.icon,
      }))}
    />
  );
};

export default HistoryMenu;