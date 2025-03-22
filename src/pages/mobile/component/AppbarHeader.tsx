import React from "react";
import styles from "../../../styles/Component.module.css";
import { Badge, Button } from "antd";
import { AiFillFilter } from "react-icons/ai";
import { FaCartArrowDown, FaPlusCircle } from "react-icons/fa";
import { IoMdArrowBack } from "react-icons/io";

interface Props {
  title: string;
  isAddButton?: boolean;
  onAction?: () => void;
  isSearched?: boolean;
  onBack?: () => void;
  isCart?: boolean;
  cartCount?: number;
  onActionCart?: () => void;
}

const AppbarHeader: React.FC<Props> = ({
  title,
  onBack,
  isAddButton = false,
  onAction,
  isSearched = false,
  isCart = false,
  cartCount = 0,
  onActionCart,
}) => {
  return (
    <div className={styles.appBar}>
      <IoMdArrowBack className={styles.buttonBack} onClick={onBack} />
      <span>{title}</span>

      {isAddButton && (
        <Button
          type="primary"
          className={styles.buttonRight}
          onClick={onAction}
          icon={<FaPlusCircle />}
        />
      )}

      {isCart && (
        <div onClick={onActionCart} className={styles.buttonRight} style={{display:"flex", alignItems:"center"}}>
          <Badge count={cartCount} showZero>
            <FaCartArrowDown style={{color:"#fff", fontSize:20}} />
          </Badge>
        </div>
      )}

      {isSearched && (
        <Button
          type="primary"
          className={styles.buttonRight}
          onClick={onAction}
          icon={<AiFillFilter />}
        >
          {" "}
          ຄົ້ນຫາ{" "}
        </Button>
      )}
    </div>
  );
};

export default AppbarHeader;
