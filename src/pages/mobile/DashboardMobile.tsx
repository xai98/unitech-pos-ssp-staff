import { Col, Input, Row, Skeleton } from "antd";
import { useState } from "react";
import styles from "../../styles/PosMobil.module.css";
import {
  addOneDate,
  currentDate,
  formatNumber,
  getUserDataFromLCStorage,
} from "../../utils/helper";
import { useQuery } from "@apollo/client";
import { GET_REPORT_ORDERS, REPORT_ORDER_CHANGE } from "../../services";
import { SearchOutlined } from "@ant-design/icons";

interface FilterProps {
  from_date?: string;
  to_date?: string;
  limit: number;
  skip: number;
  order_no: string;
  limitChange: number;
  skipChange: number;
}
function DashboardMobile() {
  const branchInfo = getUserDataFromLCStorage();
  const [filter, setFilter] = useState<FilterProps>({
    from_date: currentDate().startDate,
    to_date: currentDate().endDate,
    skip: 0,
    limit: 25,
    order_no: "",
    limitChange: 25,
    skipChange: 0,
  });

  // Get stocks with useFetchData hook
  const { data: reportData, loading: reportOrderloading } = useQuery(
    GET_REPORT_ORDERS,
    {
      fetchPolicy: "network-only",
      variables: {
        where: {
          branchId: branchInfo?.branchId?.id || undefined,
          from_date: filter?.from_date || undefined,
          to_date: addOneDate(filter?.from_date) || undefined,
        },
      },
    }
  );

  const { data: reportOrderChange, loading: reportOrderChangeloading } =
    useQuery(REPORT_ORDER_CHANGE, {
      fetchPolicy: "network-only",
      variables: {
        where: {
          branchId: branchInfo?.branchId?.id || undefined,
          from_date: filter?.from_date || undefined,
          to_date: addOneDate(filter?.from_date) || undefined,
        },
      },
    });

  const reportOrder = reportData?.reportOrders;
  const reportChange = reportOrderChange?.reportChangeOrder;

  return (
    <div>
      <Input
        type="date"
        size="large"
        placeholder="ວັນທີ...."
        onChange={(e) => {
          setFilter({ ...filter, from_date: e.target.value || "" });
        }}
        value={filter?.from_date || ""}
        prefix={<SearchOutlined />}
      />

      <div style={{height:10}}></div>

      <Row gutter={[10, 10]}>
        {reportOrderloading || reportOrderChangeloading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Col span={12} key={i}>
              <div className={styles.cardDashboard}>
                <Skeleton active />
              </div>
            </Col>
          ))
        ) : (
          <>
            <Col xs={12}>
              <div className={styles.cardDashboard}>
                <div style={{ color: "#cee7ff" }}>ອໍເດີ້ທັງໝົດ</div>
                <div style={{ fontSize: 20 }}>
                  {formatNumber(reportOrder?.totalOrders || 0)}
                </div>
              </div>
            </Col>
            <Col xs={12}>
              <div className={styles.cardDashboard}>
                <div style={{ color: "#cee7ff" }}>ຍອດຂາຍທັງໝົດ</div>
                <div style={{ fontSize: 20 }}>
                  {formatNumber(
                    reportOrder?.totalPrice +
                      reportChange?.amountAddOnNewOrder || 0
                  )}
                </div>
              </div>
            </Col>

            <Col xs={12}>
              <div className={styles.cardDashboard}>
                <div style={{ color: "#cee7ff" }}>ຮັບເງິນສົດຕົວຈິງ</div>
                <div style={{ fontSize: 20 }}>
                  {formatNumber(
                    reportOrder?.totalCashLak - reportOrder?.totalSendBack ||
                      0 +
                        (reportChange?.totalCashLak -
                          reportChange?.send_back_customer)
                  )}
                </div>
              </div>
            </Col>
            <Col xs={12}>
              <div className={styles.cardDashboard}>
                <div style={{ color: "#cee7ff" }}>ຄ່າຄອມມິດຊັ່ນພະນັກງານ</div>
                <div style={{ fontSize: 20 }}>
                  {formatNumber(reportOrder?.totalCommission || 0)}
                </div>
              </div>
            </Col>

            <Col xs={12}>
              <div className={styles.cardDashboard}>
                <div style={{ color: "#cee7ff" }}>ເງິນສົດກີບ</div>
                <div style={{ fontSize: 20 }}>
                  {formatNumber(
                    reportOrder?.totalCashLak + reportChange?.totalCashLak || 0
                  )}
                </div>
              </div>
            </Col>
            <Col xs={12}>
              <div className={styles.cardDashboard}>
                <div style={{ color: "#cee7ff" }}>ເງິນໂອນກີບ</div>
                <div style={{ fontSize: 20 }}>
                  {formatNumber(
                    reportOrder?.totalTransferLak +
                      reportChange?.totalTransferLak || 0
                  )}
                </div>
              </div>
            </Col>

            <Col xs={12}>
              <div className={styles.cardDashboard}>
                <div style={{ color: "#cee7ff" }}>ເງິນສົດບາດ</div>
                <div style={{ fontSize: 20 }}>
                  {formatNumber(reportOrder?.totalCashBath || 0)}
                </div>
              </div>
            </Col>
            <Col xs={12}>
              <div className={styles.cardDashboard}>
                <div style={{ color: "#cee7ff" }}>ເງິນໂອນບາດ</div>
                <div style={{ fontSize: 20 }}>
                  {formatNumber(reportOrder?.totalTransferBath || 0)}
                </div>
              </div>
            </Col>

            <Col xs={12}>
              <div className={styles.cardDashboard}>
                <div style={{ color: "#cee7ff" }}>
                  ລວມເງິນຮັບຈາກການປ່ຽນເຄື່ອງ
                </div>
                <div style={{ fontSize: 20 }}>
                  {formatNumber(reportChange?.amountAddOnNewOrder || 0)}
                </div>
              </div>
            </Col>
            <Col xs={12}>
              <div className={styles.cardDashboard}>
                <div style={{ color: "#cee7ff" }}>ລວມເງິນສ່ວນຫລຸດ</div>
                <div style={{ fontSize: 20 }}>
                  {formatNumber(reportOrder?.totalDiscount || 0)}
                </div>
              </div>
            </Col>

            <Col xs={24}>
              <div className={styles.cardDashboard}>
                <div style={{ color: "#cee7ff" }}>ເງິນທອນ</div>
                <div style={{ fontSize: 20 }}>
                  {formatNumber(reportOrder?.totalSendBack || 0)}
                </div>
              </div>
            </Col>
          </>
        )}
      </Row>
    </div>
  );
}

export default DashboardMobile;
