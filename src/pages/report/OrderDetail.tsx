import { Button, Col, Divider, Drawer, Flex, Row, Space } from "antd";
import {
  converTypePay,
  formatDate,
  formatNumber,
  getUserDataFromLCStorage,
} from "../../utils/helper";
import { BillComponent } from "../../components/BillComponent";
import ReactToPrint from "react-to-print";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import routes from "../../utils/routes";

interface ViewDetailProps {
  viewDetail: any;
  onClose: () => void;
}

interface DescriptionItemProps {
  title: string;
  content: any;
}

const ViewDetailOrder: React.FC<ViewDetailProps> = ({
  viewDetail,
  onClose,
}) => {
  const navigate = useNavigate()
  const branchInfo = getUserDataFromLCStorage();
  const detail = viewDetail.data;

  //print bill
  const printComponentRef = useRef<any>(null);
  const reactToPrintContent = useRef<any>(null); // Ensure the ref type is correct

  const handlePrintBill = () => {
    if (reactToPrintContent.current) {
      reactToPrintContent.current.handlePrint();
    } // Trigger print after saving order
  };

  const handleChangeProduct = () => {
    navigate(routes.CHANGE_PRODUCT + "/" + detail?.id)
  }

  return (
    <div>
      <Drawer
        width={640}
        placement="right"
        title={"ລາຍລະອຽດການສັ່ງຊື້"}
        closable={true}
        onClose={onClose}
        open={viewDetail.show}
        extra={
          <Space>
            <Button onClick={handlePrintBill} type="primary">
              ພິມບິນ
            </Button>
            <Button onClick={handleChangeProduct} type="primary">
              ປ່ຽນເຄື່ອງ
            </Button>
          </Space>
        }
      >
        <Row>
          <Col span={12}>
            <DescriptionItem
              title={"ສາຂາ"}
              content={detail?.branchId?.branchName}
            />
          </Col>
          <Col span={12}>
            <DescriptionItem title="ພະນັກງານຂາຍ" content={detail?.createdBy} />
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <DescriptionItem title={"ເລກທີບິນ"} content={detail?.order_no} />
          </Col>
          <Col span={8}>
            <DescriptionItem
              title="ວັນທີຂາຍ"
              content={formatDate(detail?.createdAt)}
            />
          </Col>
          <Col span={8}>
            <DescriptionItem
              title="ປະເພດຊຳລະ"
              content={converTypePay(detail?.typePay)}
            />
          </Col>
        </Row>

        <Divider />
        <p className="site-description-item-profile-p">ລາຍການສັ່ງຊື້</p>

        {detail?.order_items?.map((item: any, index: number) => (
          <div
            className="order-item"
            key={item?.productId}
            style={{
              backgroundColor: index === 0 ? "#f0f9ff" : "",
              padding: 10,
              //   borderBottom: "1px solid #eee",
            }}
          >
            <Flex
              justify={"space-between"}
              align={"center"}
              //   style={{ fontSize: 1 }}
            >
              <div>
                {index + 1}. {item?.productName}
              </div>
              <Flex justify="end" align="center" gap={10}>
                {formatNumber(item.price_sale || 0)} x{" "}
                {formatNumber(item.order_qty || 0)}
              </Flex>
              <div style={{ height: 5 }}></div>
              <Flex
                justify="space-between"
                align="center"
                gap={10}
                style={{ fontSize: 14, color: "gray" }}
              >
                <div>{formatNumber(item.order_total_price || 0)} ກີບ</div>
              </Flex>
            </Flex>
          </div>
        ))}

        <Divider style={{ margin: 0 }} />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 15,
            margin: 0,
            padding: 0,
          }}
        >
          <p style={{ padding: 0, margin: 0, fontWeight: "bold" }}>ລວມ</p>
          <p style={{ padding: 0, margin: 0, fontWeight: "bold" }}>
            {formatNumber(detail?.total_price || 0)} ກີບ
          </p>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 15,
            margin: 0,
            padding: 0,
            fontWeight: "bold",
          }}
        >
          <p style={{ padding: 0, margin: 0, fontWeight: "bold" }}>
            ສ່ວນຫຼຸດ(
            {detail?.typeDiscount === "AMOUNT"
              ? "ເປັນຈຳນວນເງິນ"
              : detail?.typeDiscount === "PERCENT"
              ? detail?.discount + "%"
              : detail?.typeDiscount}
            )
          </p>

          <p style={{ padding: 0, margin: 0, fontWeight: "bold" }}>
            {formatNumber(
              detail?.typeDiscount === "PERCENT"
                ? detail?.total_price * (detail?.discount / 100)
                : detail?.discount || 0
            )}{" "}
            ກີບ
          </p>
        </div>

        <Divider style={{ margin: 0 }} />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 17,
            margin: 0,
            padding: 0,
          }}
        >
          <p style={{ padding: 0, margin: 0, fontWeight: "bold" }}>
            ຊຳລະຕົວຈິງກີບ
          </p>
          <p style={{ padding: 0, margin: 0, fontWeight: "bold" }}>
            {formatNumber(detail?.final_receipt_total || 0)} ກີບ
          </p>
        </div>

        <Divider style={{ margin: 0 }} />

        <p className="site-description-item-profile-p">ຂໍ້ມູນການຊຳລະເງິນສົດ</p>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 17,
            margin: 0,
            padding: 0,
          }}
        >
          <p style={{ padding: 0, margin: 0, fontWeight: "bold" }}>ສົດກີບ</p>
          <p style={{ padding: 0, margin: 0, fontWeight: "bold" }}>
            {formatNumber(detail?.cash_lak || 0)} ກີບ
          </p>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 17,
            margin: 0,
            padding: 0,
          }}
        >
          <p style={{ padding: 0, margin: 0, fontWeight: "bold" }}>ສົດບາດ</p>
          <p style={{ padding: 0, margin: 0, fontWeight: "bold" }}>
            {formatNumber(detail?.cash_bath || 0)} bath
          </p>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 17,
            margin: 0,
            padding: 0,
          }}
        >
          <p style={{ padding: 0, margin: 0, fontWeight: "bold" }}>ສົດໂລດາ</p>
          <p style={{ padding: 0, margin: 0, fontWeight: "bold" }}>
            {formatNumber(detail?.cash_usd || 0)} usd
          </p>
        </div>
        <p className="site-description-item-profile-p">ຂໍ້ມູນການຊຳລະເງິນໂອນ</p>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 17,
            margin: 0,
            padding: 0,
          }}
        >
          <p style={{ padding: 0, margin: 0, fontWeight: "bold" }}>ໂອນກີບ</p>
          <p style={{ padding: 0, margin: 0, fontWeight: "bold" }}>
            {formatNumber(detail?.transfer_lak || 0)} ກີບ
          </p>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 17,
            margin: 0,
            padding: 0,
          }}
        >
          <p style={{ padding: 0, margin: 0, fontWeight: "bold" }}>ໂອນບາດ</p>
          <p style={{ padding: 0, margin: 0, fontWeight: "bold" }}>
            {formatNumber(detail?.transfer_bath || 0)} bath
          </p>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 17,
            margin: 0,
            padding: 0,
          }}
        >
          <p style={{ padding: 0, margin: 0, fontWeight: "bold" }}>ໂອນໂລດາ</p>
          <p style={{ padding: 0, margin: 0, fontWeight: "bold" }}>
            {formatNumber(detail?.transfer_usd || 0)} usd
          </p>
        </div>

        <p className="site-description-item-profile-p">ອັດຕາແລກປ່ຽນ</p>
        <Row>
          <Col span={12}>
            <DescriptionItem
              title={"1 ບາດ"}
              content={formatNumber(detail?.exchangeRate.bath || 0)}
            />
          </Col>
          <Col span={12}>
            <DescriptionItem
              title="1 ໂດລາ"
              content={formatNumber(detail?.exchangeRate?.usd || 0)}
            />
          </Col>
        </Row>

        <div style={{ display: "none" }}>
          <ReactToPrint
            trigger={() => <></>}
            content={() => printComponentRef.current}
            ref={reactToPrintContent}
          />

          <div ref={printComponentRef}>
            <BillComponent detail={detail} branchInfo={branchInfo} />
          </div>
        </div>
      </Drawer>
    </div>
  );
};

const DescriptionItem: React.FC<DescriptionItemProps> = ({
  title,
  content,
}) => (
  <div className="site-description-item-profile-wrapper">
    <p
      className="site-description-item-profile-p-label"
      style={{ color: "gray" }}
    >
      {title}:
    </p>
    {content}
  </div>
);

export default ViewDetailOrder;
