import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PoweroffOutlined,
} from "@ant-design/icons";
import { Button, Layout, theme, message, Modal } from "antd";
import styled from "styled-components";

import MenuItemList from "./components/MenuItem";
import { getUserDataFromLCStorage, parseJwt, useAuth } from "../utils/helper";
import { consts } from "../utils";
import { useDeviceType } from "./useDeviceType";
import routes from "../utils/routes";

const { Sider, Content } = Layout;

// Styled Components
const StyledSider = styled(Sider)`
  position: fixed; /* Fixed position to stay on the left */
  left: 0;
  top: 0;
  bottom: 0;
  height: 100vh; /* Full viewport height */
  background-color: #1976d2 !important;
  overflow-y: auto; /* Scroll within sidebar if content is long */
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  transition: width 0.3s ease; /* Smooth width transition */
  z-index: 1000; /* Ensure it stays above content */
`;

const LogoContainer = styled.div<{ collapsed: boolean }>`
  padding: 16px;
  color: white;
  text-align: center;
  transition: all 0.3s ease;

  h1 {
    margin: 0;
    font-size: ${({ collapsed }) => (collapsed ? "16px" : "20px")};
    overflow: hidden;
    white-space: nowrap;
  }

  p {
    margin: 4px 0 0;
    font-size: 12px;
    opacity: ${({ collapsed }) => (collapsed ? 0 : 1)};
    height: ${({ collapsed }) => (collapsed ? 0 : "auto")};
    transition: all 0.3s ease;
  }
`;

const ContentWrapper = styled(Layout)<{ collapsed: boolean }>`
  margin-left:  ${({ collapsed }) => (collapsed ? "0px" : "0px")}
  transition: margin-left 0.3s ease; /* Smooth transition for margin */
  min-height: 100vh; /* Ensure full height */
  background: #f0f2f5;
`;

const StyledContent = styled(Content)`
  height: 100vh; /* Full height for content */
  overflow-y: auto; /* Scroll only content if needed */
`;

const ActionButtons = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PrivateRoute: React.FC = () => {
  const {
    token: { borderRadiusLG, colorBgContainer },
  } = theme.useToken();
  const navigate = useNavigate();
  const deviceType = useDeviceType();
  const isAuthenticated = useAuth();
  const branchInfo = getUserDataFromLCStorage();

  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (deviceType === "Mobile") {
      navigate(routes.HOME_MOBILE);
    }
  }, [deviceType, navigate]);

  useEffect(() => {
    const token = localStorage.getItem(consts.USER_TOKEN);
    if (token) {
      const decodedToken = parseJwt(token);
      if (decodedToken.exp * 1000 < Date.now()) {
        message.warning("เซสชันของคุณหมดอายุ กรุณาเข้าสู่ระบบใหม่");
        handleLogout();
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    Modal.confirm({
      title: "ຢືນຢັນການອອກຈາກລະບົບ",
      content: (
        <div>
          <div>ທ່ານຕ້ອງການອອກຈາກລະບົບ ແທ້ ຫຼື ບໍ່ ?</div>
        </div>
      ),
      okText: "ອອກຈາກລະບົບ",
      cancelText: "ປິດອອກ",
      onOk() {
        localStorage.removeItem(consts.USER_TOKEN);
        localStorage.removeItem(consts.USER_KEY);
        localStorage.removeItem("VIXAY_POS");
        navigate("/login");
      },
    });
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      {deviceType === "Mobile" ? (
        <Outlet />
      ) : (
        <Layout style={{ minHeight: "100vh" }}>
          <StyledSider
            width={250}
            collapsedWidth={80}
            collapsible
            collapsed={collapsed}
            trigger={null}
          >
            <LogoContainer collapsed={collapsed}>
              <h1>{branchInfo?.branchId?.branchName}</h1>
              <p>ຮ້ານມິນິມາກ ສວນເສືອປ່າ</p>
            </LogoContainer>

            <MenuItemList collapsed={collapsed} />

            <ActionButtons>
              <Button
                type="primary"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                block
              >
                {!collapsed && "ຍ່ອຍເມນູ"}
              </Button>
              <Button
                danger
                icon={<PoweroffOutlined />}
                onClick={handleLogout}
                block
              >
                {!collapsed && "ອອກຈາກລະບົບ"}
              </Button>
            </ActionButtons>
          </StyledSider>

          <ContentWrapper collapsed={collapsed}>
            <StyledContent
              style={{
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
              }}
            >
              <Outlet />
            </StyledContent>
          </ContentWrapper>
        </Layout>
      )}
    </>
  );
};

export default PrivateRoute;
