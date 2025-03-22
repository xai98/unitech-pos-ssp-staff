import styles from "../../styles/Login.module.css";
import FormLogin from "./component/FormLogin";

function LoginPage() {
  return (
    <div className={styles.loginpage}>
        <div className={styles.boxContainer}>
        <img alt="logo" src="/logoMinipos.jpg" style={{ width: 100, height: 100 }} /> 
          <h2>Unitech POS</h2>
          <h2>ເຂົ້າສູ່ລະບົບ</h2>
          <div style={{height:12}}></div>
          <FormLogin />
        </div>
    </div>
  );
}

export default LoginPage;
