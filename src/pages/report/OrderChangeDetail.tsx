import { Card, Col, Divider, Drawer, Flex, Row, } from "antd";
import {
  converTypePay,
  formatDate,
  formatNumber,
  getUserDataFromLCStorage,
} from "../../utils/helper";
import { BillComponent } from "../../components/BillComponent";
import ReactToPrint from "react-to-print";
import { useRef } from "react";

interface Props {
  viewDetail: any;
  onClose: () => void;
}

interface DescriptionItemProps {
  title: string;
  content: any;
}

const ViewDetailOrderChange: React.FC<Props> = ({ viewDetail, onClose }) => {
  const branchInfo = getUserDataFromLCStorage();
  const detail = viewDetail.data;

  //print bill
  const printComponentRef = useRef<any>(null);
  const reactToPrintContent = useRef<any>(null); // Ensure the ref type is correct


  return (
    <div>
      <Drawer
        width={900}
        placement="right"
        title={"ລາຍລະອຽດການສັ່ງຊື້"}
        closable={true}
        onClose={onClose}
        open={viewDetail.show}
        // extra={
        //   <Space>
        //     <Button onClick={handlePrintBill} type="primary">
        //       ພິມບິນ
        //     </Button>

        //   </Space>
        // }
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
              title="ວັນທີປ່ຽນ"
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
        {/* <p className="site-description-item-profile-p">ລາຍການສັ່ງຊື້</p> */}

        <Row gutter={16}>
          <Col span={8}>
            <Card title="ລາຍການສັ່ງຊື້ກ່ອນປ່ຽນ" bordered={false}>
              {detail?.oldItem?.map((item: any, index: number) => (
                <div
                  key={item?.productId}
                  style={{ marginBottom: 10, borderBottom: "1px solid #eee" }}
                >
                  <Flex justify={"space-between"} align={"center"}>
                    <div>
                      {index + 1}. {item?.productName}
                      <Flex
                        justify="start"
                        align="center"
                        gap={10}
                        style={{ paddingLeft: 13 }}
                      >
                        {formatNumber(item.price_sale || 0)} x{" "}
                        {formatNumber(item.order_qty || 0)}
                      </Flex>
                    </div>
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

              <div>
                <Flex justify={"space-between"} align={"center"}>
                  <div>ລວມເງິນ</div>
                  <div style={{ height: 5 }}></div>
                  <Flex
                    justify="space-between"
                    align="center"
                    gap={10}
                    style={{ fontSize: 14, color: "black", fontWeight: "bold" }}
                  >
                    <div>{formatNumber(detail?.totalOldOrder || 0)} ກີບ</div>
                  </Flex>
                </Flex>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card title="ລາຍການຖືກປ່ຽນ" bordered={false}>
              {detail?.changeItem?.map((item: any, index: number) => (
                <div
                  key={item?.productId}
                  style={{ marginBottom: 10, borderBottom: "1px solid #eee" }}
                >
                  <Flex justify={"space-between"} align={"center"}>
                    <div>
                      {index + 1}. {item?.productName}
                      <Flex
                        justify="start"
                        align="center"
                        gap={10}
                        style={{ paddingLeft: 13 }}
                      >
                        {formatNumber(item.price_sale || 0)} x{" "}
                        {formatNumber(item.order_qty || 0)}
                      </Flex>
                    </div>
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

              <div>
                <Flex justify={"space-between"} align={"center"}>
                  <div>ລວມເງິນ</div>
                  <div style={{ height: 5 }}></div>
                  <Flex
                    justify="space-between"
                    align="center"
                    gap={10}
                    style={{ fontSize: 14, color: "black", fontWeight: "bold" }}
                  >
                    <div>{formatNumber(detail?.toalChangeOrder || 0)} ກີບ</div>
                  </Flex>
                </Flex>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card title="ລາຍການປ່ຽນໃໝ່" bordered={false}>
              {detail?.newChangeItem?.map((item: any, index: number) => (
                <div
                  key={item?.productId}
                  style={{ marginBottom: 10, borderBottom: "1px solid #eee" }}
                >
                  <Flex justify={"space-between"} align={"center"}>
                    <div>
                      {index + 1}. {item?.productName}
                      <Flex
                        justify="start"
                        align="center"
                        gap={10}
                        style={{ paddingLeft: 13 }}
                      >
                        {formatNumber(item.price_sale || 0)} x{" "}
                        {formatNumber(item.order_qty || 0)}
                      </Flex>
                    </div>
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

              <div>
                <Flex justify={"space-between"} align={"center"}>
                  <div>ລວມເງິນ</div>
                  <div style={{ height: 5 }}></div>
                  <Flex
                    justify="space-between"
                    align="center"
                    gap={10}
                    style={{ fontSize: 14, color: "black", fontWeight: "bold" }}
                  >
                    <div>{formatNumber(detail?.totalNewOrder || 0)} ກີບ</div>
                  </Flex>
                </Flex>
              </div>
            </Card>
          </Col>
        </Row>

        <Divider style={{ margin: 0 }} />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 15,
            marginTop: 10,
            padding: 0,
          }}
        >
          <p style={{ padding: 0, margin: 0, fontWeight: "bold" }}>
            ລວມເງິນຮັບເພີ່ມ
          </p>
          <p style={{ padding: 0, margin: 0, fontWeight: "bold" }}>
            {formatNumber(detail?.amountAddOnNewOrder || 0)} ກີບ
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
            {formatNumber(detail?.amountAddOnNewOrder || 0)} ກີບ
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
        <p className="site-description-item-profile-p">ຂໍ້ມູນການທອນເງິນ</p>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 17,
            margin: 0,
            padding: 0,
          }}
        >
          <p style={{ padding: 0, margin: 0, fontWeight: "bold" }}>ເງິນທອນ</p>
          <p style={{ padding: 0, margin: 0, fontWeight: "bold" }}>
            {formatNumber(detail?.send_back_customer || 0)} ກີບ
          </p>
        </div>

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

export default ViewDetailOrderChange;
