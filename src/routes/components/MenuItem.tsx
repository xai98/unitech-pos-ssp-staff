import React, { useCallback } from "react";
import {
  OrderedListOutlined,
  HistoryOutlined,
  PrinterOutlined,
  StockOutlined,
  ProductOutlined,
} from "@ant-design/icons";
import { Tooltip } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import routes from "../../utils/routes";

// Styled Components
const MenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 0;
`;

const MenuItem = styled.div<{ active: boolean; collapsed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${({ collapsed }) => (collapsed ? "center" : "flex-start")}; /* Center when collapsed */
  padding: ${({ collapsed }) => (collapsed ? "10px 0" : "10px 16px")}; /* Adjust padding */
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: ${({ active }) => (active ? "rgba(255, 255, 255, 0.2)" : "transparent")};
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const MenuIcon = styled.div<{ collapsed: boolean }>`
  font-size: 20px;
  margin-right: ${({ collapsed }) => (collapsed ? "0" : "12px")}; /* No margin when collapsed */
`;

const MenuLabel = styled.span`
  font-size: 14px;
  white-space: nowrap;
`;

// Menu Items Definition
interface MenuItemType {
  key: string;
  icon: React.ReactNode;
  label: string;
  route?: string;
}

const menuItems: MenuItemType[] = [
  {
    key: "0",
    icon: <PrinterOutlined />,
    label: "ສ້າງລາຍການຂາຍ",
    route: routes.POS_SALE,
  },
  {
    key: "2",
    icon: <OrderedListOutlined />,
    label: "ລາຍງານ",
    route: routes.REPORT_DASHBOARD,
  },
  {
    key: "3",
    icon: <StockOutlined />,
    label: "ກວດສອບສະຕ໋ອກສິນຄ້າ",
    route: routes.STOCK_LIST,
  },
  {
    key: "4",
    icon: <ProductOutlined />,
    label: "ປະຫວັດການແຈ້ງເບິກສະຕ໋ອກ",
    route: routes.HISTORY_REQUEST_STOCK_PAGE,
  },
  {
    key: "5",
    icon: <HistoryOutlined />,
    label: "ປະຫວັດການເຄື່ອນໄຫວສະຕ໋ອກ",
    route: routes.HISTORY_STOCK_LIST,
  },
];

interface Props {
  collapsed?: boolean;
}

const MenuItemList: React.FC<Props> = React.memo(({ collapsed = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenu = useCallback(
    (route?: string) => {
      if (route) {
        navigate(route, { replace: true });
      }
    },
    [navigate]
  );

  return (
    <MenuContainer>
      {menuItems.map((item) => {
        const isActive = item.route === location.pathname;

        return (
          <MenuItem
            key={item.key}
            active={isActive}
            collapsed={collapsed}
            onClick={() => handleMenu(item.route)}
          >
            {collapsed ? (
              <Tooltip placement="rightTop" title={item.label} arrow>
                <MenuIcon collapsed={collapsed}>{item.icon}</MenuIcon>
              </Tooltip>
            ) : (
              <>
                <MenuIcon collapsed={collapsed}>{item.icon}</MenuIcon>
                <MenuLabel>{item.label}</MenuLabel>
              </>
            )}
          </MenuItem>
        );
      })}
    </MenuContainer>
  );
});

export default MenuItemList;