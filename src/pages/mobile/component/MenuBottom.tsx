import { useLocation, useNavigate } from "react-router-dom";
import routes from "../../../utils/routes";
import styles from "../../../styles/Component.module.css"
import { MdOutlinePointOfSale } from "react-icons/md";



function MenuBottom() {

  const navigate = useNavigate();

  const {pathname} = useLocation();

  const path = pathname.split('/')[1];

  const handleNext = (path: string) => {
    navigate(path, {replace: true});
  }

  return (
    <div style={{ position: "absolute", bottom: "0%", width: "100%",backgroundColor:"#00488c",color:"#fff" }}>
      {/* <Flex justify="space-around" align="center" style={{ padding:"10px 0px" }}> */}
        <div style={{ textAlign: "center",padding:"10px 0px" }} className={path === 'home' ? styles.activeBottomMenu : ''} onClick={() => handleNext(routes.POS_MOBILE_PAGE)}>
          <MdOutlinePointOfSale style={{fontSize:20}} />
          <div style={{fontSize:12}}>ເລີ່ມຂາຍ</div>
        </div>
        {/* <div style={{ textAlign: "center" }} className={path === 'leave' ? styles.activeBottomMenu : ''} onClick={() => handleNext(routes.HOME)}>
          <LuCalendarDays style={{fontSize:20}} />
          <div style={{fontSize:12}}>ພັກວຽກ</div>
        </div>
        <div style={{ textAlign: "center" }} className={path === 'attendace' ? styles.activeBottomMenu : ''} onClick={() => handleNext(routes.HOME)}>
          <CiViewList style={{fontSize:20}} />
          <div style={{fontSize:12}}>ເຂົ້າວຽກ</div>
        </div>
        <div style={{ textAlign: "center"}} className={path === 'ot' ? styles.activeBottomMenu : ''} onClick={() => handleNext(routes.HOME)}>
          <IoMdTime style={{fontSize:20}} />
          <div style={{fontSize:12}}>ໂອທີ</div>
        </div>
        <div style={{ textAlign: "center" }} className={path === 'profile' ? styles.activeBottomMenu : ''} onClick={() => handleNext(routes.HOME)}>
          <FaRegCircleUser style={{fontSize:20}} />
          <div style={{fontSize:12}}>ໂປຣຟາຍ</div>
        </div> */}
      {/* </Flex> */}
    </div>
  );
}

export default MenuBottom;
