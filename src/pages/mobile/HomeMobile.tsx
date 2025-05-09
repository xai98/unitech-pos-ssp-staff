import { Badge, Flex, Modal } from "antd";
import MenuBottom from "./component/MenuBottom";
import styles from "../../styles/Component.module.css";
import DashboardMobile from "./DashboardMobile";
import { CiLogout } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import { consts } from "../../utils";

function HomeMobile() {
  const navigate = useNavigate();

  const handleLogOut = () => {
    Modal.confirm({
      title: "ຢືນຢັນອອກຈາກລະບົບ",
      content: <div>ທ່ານຕ້ອງການອອກຈາກລະບົບແທ້ ຫຼື ບໍ່</div>,
      okText: "ອອກຈາກລະບົບ",
      cancelText: "ປິດອອກ",
      centered:true,
      okType: "danger",
      onOk() {
        localStorage.removeItem(consts.USER_KEY);
        localStorage.removeItem(consts.USER_TOKEN);
        navigate("/login");
      },
    });
  };

  return (
    <div style={{ backgroundColor: "#1976d2", height: "100dvh" }}>
      <div className={styles.bgCard}>
        <Flex justify="space-between" align="center" gap={0}>
          <div style={{ fontSize: 25, color: "#fff", fontWeight: "bold" }}>
            EASY POS
          </div>
          <div onClick={handleLogOut}>
            <Badge count={0}>
              <CiLogout style={{ fontSize: 30, color: "#fff" }} />
            </Badge>
          </div>
        </Flex>
      </div>

      <div style={{ padding: 10, height:'80dvh', overflowY:"scroll", }}>
        <DashboardMobile />
      </div>

      <MenuBottom />
    </div>
  );
}

export default HomeMobile;
