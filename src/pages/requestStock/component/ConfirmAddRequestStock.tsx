import React from "react";
import {
  CellTd,
  CellTh,
} from "../../../components/stylesComponent/otherComponent";
import { formatNumber } from "../../../utils/helper";
import { Image, Modal } from "antd";
import { consts } from "../../../utils";

interface Props {
  open: boolean;
  onClose: () => void;
  data: any[];
  handleConfirm: () => void;
}

const ConfirmAddRequestStock: React.FC<Props> = ({
  open,
  onClose,
  data,
  handleConfirm,
}) => {
  return (
    <div>
      <Modal
        title={`ຢືນຢັນຂໍ້ມູນການເພີ່ມລາຍການຮ້ອງຊໍ`}
        open={open}
        onOk={handleConfirm}
        onCancel={onClose}
        width={1000}
        cancelText={"ປິດອອກ"}
        okText={"ຢືນຢັນ"}
      >
        <div style={{ maxHeight: 500, overflowY: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead
              style={{
                position: "sticky",
                top: 0,
                background: "#fff",
                zIndex: 1,
              }}
            >
              <tr>
                <CellTh>#</CellTh>
                <CellTh style={{ textAlign: "left" }}>ຮູບ</CellTh>
                <CellTh style={{ textAlign: "left" }}>ລາຍການ</CellTh>
                <CellTh>ຈຳນວນຂໍເພີ່ມ</CellTh>
                <CellTh>ລາຍລະອຽດ</CellTh>
              </tr>
            </thead>
            <tbody>
              {data &&
                data
                  ?.filter((qty: any) => qty.amountRequest > 0)
                  ?.map((item, index) => (
                    <tr key={index}>
                      <CellTd>{index + 1}</CellTd>
                      <CellTd>
                        {" "}
                        <Image
                          src={consts.URL_PHOTO_AW3 + item?.image}
                          alt="image"
                          style={{ width: 60 }}
                        />
                      </CellTd>
                      <CellTd style={{ textAlign: "left" }}>
                        {item?.productName}
                        <div style={{color:'gray'}}>ລາຄາ: {formatNumber(item?.price_sale)}</div>
                      </CellTd>
                      <CellTd>{formatNumber(item?.amountRequest || 0)}</CellTd>
                      <CellTd>{item?.note}</CellTd>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
};

export default ConfirmAddRequestStock;
