import React from "react";
import { formatDate, formatNumber } from "../utils/helper";

interface BillProps {
    branchInfo: any;
    detail: any;
  }

export class BillComponent extends React.Component<BillProps> {
    render() {
      const {
        detail,
        branchInfo
      } = this.props;

      return (
        <div style={{ fontFamily: "Phetsarath OT", padding: 10 }}>
          {/* logo */}
          <div
            style={{
              marginBottom: 10,
              textAlign: "center",
              color: "#000000",
              borderBottom: "1px solid gray",
            }}
          >
            {/* <img alt="logo" src="/logoMinipos.jpg" style={{ width: 70, height: 70,backgroundColor:"#eee",borderRadius:"50%" }} /> */}

            <div style={{ fontWeight: "bold" }}>
              <div
                style={{
                  padding: 0,
                  margin: 0,
                  fontWeight: "bold !important",
                  color: "#000000",
                }}
              >
                ຮ້ານມິນິມາກ ສວນເສືອປ່າ
              </div>
              <div
                style={{
                  padding: 0,
                  margin: 0,
                  fontWeight: "bold",
                  fontSize: "20px",
                }}
              >
                ສາຂາ {branchInfo?.branchId?.branchName}
              </div>
              <div
                style={{
                  padding: 0,
                  margin: 0,
                  color: "#000000",
                  fontSize: "15px",
                }}
              >
                ພະນັກງານ: {detail?.createdBy}
              </div>
            </div>
          </div>
          {/* logo */}
  
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 13,
              margin: 0,
              padding: 0,
              fontWeight: "bold",
              color: "#000000",
              flexDirection: "column",
              borderBottom: "1px solid gray",
            }}
          >
            <p
              style={{
                padding: 0,
                margin: 0,
                // fontWeight: "bold !important",
                color: "black",
              }}
            >
              ເລກບິນ: {detail?.order_no}
            </p>
            <p
              style={{
                padding: 0,
                margin: 0,
                // fontWeight: "bold !important",
                color: "black",
              }}
            >
              ພະນັກງານ: {branchInfo?.firstName} {branchInfo?.lastName}
            </p>
            <p
              style={{
                padding: 0,
                margin: 0,
                // fontWeight: "bold",
                color: "black",
              }}
            >
              ວັນທີ: {formatDate(detail?.createdAt)}
            </p>
          </div>
  
          <p style={{ margin: 0 }}>ລາຍການສິນຄ້າ</p>
          {detail?.order_items &&
            detail?.order_items?.map((item:any, index:number) => (
              <div
                key={item?.id}
                style={{
                  display: "flex",
                  // justifyContent: "space-between",
                  flexDirection: "column",
                  fontWeight: "bold",
                  fontSize: 13,
                  // borderBottom: "0.1px solid #eee",
                }}
              >
                <div>
                  {index + 1}. {item?.productName || "-"}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ paddingLeft: 10 }}>
                    ({formatNumber(item?.order_qty || 0)} x{" "}
                    {formatNumber(item?.price_sale || 0)})
                  </div>
                  <div>{formatNumber(item?.order_total_price || 0)}</div>
                </div>
              </div>
            ))}
  
          <div
            style={{
              borderTop: "1px solid gray",
              display: "flex",
              justifyContent: "space-between",
              fontSize: 14,
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
              fontSize: 13,
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
  
          <div
            style={{
              borderTop: "0.1px solid gray",
              display: "flex",
              justifyContent: "space-between",
              fontSize: 14,
              margin: 0,
              padding: 0,
              fontWeight: "bold",
            }}
          >
            <p style={{ padding: 0, margin: 0 }}>ຊຳລະຕົວຈິງກີບ</p>
            <p style={{ padding: 0, margin: 0, fontWeight: 900 }}>
              {formatNumber(detail?.cash_lak || 0)} ກີບ
            </p>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 13,
              margin: 0,
              padding: 0,
            }}
          >
            <p style={{ padding: 0, margin: 0 }}>ຈ່າຍບາດ</p>
            <p style={{ padding: 0, margin: 0, fontWeight: 900 }}>
              {formatNumber(detail?.cash_bath || 0)} ບາດ
            </p>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 13,
              margin: 0,
              padding: 0,
            }}
          >
            <div style={{ padding: 0, margin: 0 }}>ຈ່າຍໂດລາ</div>
            <div style={{ padding: 0, margin: 0, fontWeight: 900 }}>
              {formatNumber(detail?.cash_usd || 0)} ໂດລາ
            </div>
          </div>
  
          <div
            style={{
              borderTop: "0.1px solid gray",
              display: "flex",
              justifyContent: "space-between",
              fontSize: 14,
              margin: 0,
              padding: 0,
              fontWeight: "bold",
            }}
          >
            <p style={{ padding: 0, margin: 0 }}>ເງິນທອນ</p>
            <p style={{ padding: 0, margin: 0, fontWeight: 900 }}>
              {formatNumber(detail?.send_back_customer || 0)} ກີບ
            </p>
          </div>
  
  
  
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              fontSize: 13,
              margin: 0,
              padding: 0,
            }}
          >
            <div style={{ padding: 0, margin: 0 }}>
              1 BATH = {formatNumber(detail?.exchangeRate?.bath || 0)}
            </div>
            <div style={{ padding: 0, margin: 0 }}>
              1 USD = {formatNumber(detail?.exchangeRate?.usd || 0)}
            </div>
          </div>
  
          <p
            style={{
              padding: 0,
              margin: 0,
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            ຂໍຂອບໃຈ
          </p>
        </div>
      );
    }
  }