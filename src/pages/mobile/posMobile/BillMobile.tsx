import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatNumber } from "../../../utils/helper";
import moment from "moment";
import { useLazyQuery } from "@apollo/client";
import { GET_ORDER } from "../../../services";
import { Affix, Spin } from "antd";
import AppbarHeader from "../component/AppbarHeader";
import routes from "../../../utils/routes";

function BillMobile() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [loadOrder, { data: order, loading }] = useLazyQuery(GET_ORDER);

  useEffect(() => {
    if (orderId) {
      loadOrder({
        variables: {
          where: {
            id: orderId,
          },
        },
      });
    }
  }, [orderId]);


  const orderInfo = order?.order;

  const backSale = () => {
    navigate(routes.POS_MOBILE_PAGE, {replace:true})
  }


  return (
    <div>
      <Affix offsetTop={0}>
        <div style={{ backgroundColor: "#fff" }}>
          <AppbarHeader
            onBack={backSale}
            title="ບິນຮັບເງິນ"    
          />
    
        </div>
      </Affix>
      <Spin size="large" spinning={loading} tip="ກຳລັງໂຫລດຂໍ້ມູນ...">
         <Bill orderInfo={orderInfo} />
      </Spin>
    </div>
  );
}

interface BillProps {
  orderInfo: any;
}

class Bill extends React.Component<BillProps> {
  render() {
    const { orderInfo } = this.props;
    return (
      <div style={{ fontFamily: "Phetsarath OT", padding: 10 }}>
        {/* logo */}
        <div
          style={{
            marginBottom: 10,
            textAlign: "center",
            color: "#000000",
          }}
        >
         <center>
            <img src="/logoMinipos.jpg" style={{width:100,height:100}} />
         </center>


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
              ສາຂາ {orderInfo?.branchName}
            </div>
            
          </div>
        </div>
        {/* logo */}
        

        <div style={{height:20}}></div>


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
            ເລກບິນ: {orderInfo?.order_no}
          </p>
          <p
            style={{
              padding: 0,
              margin: 0,
              color: "black",
            }}
          >
            ພະນັກງານ:{orderInfo?.createdBy}
          </p>
          <p
            style={{
              padding: 0,
              margin: 0,
              color: "black",
            }}
          >
            ວັນທີ: {moment(new Date()).format("DD-MM-YYYY HH:mm")}
          </p>
        </div>

        <p style={{ margin: 0 }}>ລາຍການສິນຄ້າ</p>
        {orderInfo?.order_items &&
          orderInfo?.order_items?.map((item: any, index: any) => (
            <div
              key={item?.id}
              style={{
                display: "flex",
                flexDirection: "column",
                fontWeight: "bold",
                fontSize: 13,
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
            {formatNumber(orderInfo?.total_price || 0)} ກີບ
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
            {orderInfo?.discount_type === "AMOUNT"
              ? "ເປັນຈຳນວນເງິນ"
              : orderInfo?.discount_type === "PERCENT"
              ? orderInfo?.discount + "%"
              : orderInfo?.discount_type}
            )
          </p>

          <p style={{ padding: 0, margin: 0, fontWeight: "bold" }}>
            {formatNumber(
              orderInfo?.discount_type === "PERCENT"
                ? orderInfo?.total_price * (orderInfo?.discount / 100)
                : orderInfo?.discount || 0
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
            {formatNumber(orderInfo?.final_receipt_total || 0)} ກີບ
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
            {orderInfo?.final_receipt_total && orderInfo?.exchangeRate?.bath
              ? formatNumber(
                  parseFloat(
                    (
                      orderInfo.final_receipt_total /
                      orderInfo.exchangeRate.bath
                    ).toFixed(2)
                  )
                )
              : 0} ບາດ
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
          <p style={{ padding: 0, margin: 0 }}>ເງິນທອນ</p>
          <p style={{ padding: 0, margin: 0, fontWeight: 900 }}>
            {formatNumber(orderInfo?.send_back_customer || 0)} ກີບ
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
            1 BATH = {formatNumber(orderInfo?.exchangeRate?.bath || 0)}
          </div>
          <div style={{ padding: 0, margin: 0 }}>
            1 USD = {formatNumber(orderInfo?.exchangeRate?.usd || 0)}
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

export default BillMobile;
