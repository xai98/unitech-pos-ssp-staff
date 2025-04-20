import React, { useEffect, useRef, useState } from "react";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import ReactToPrint from "react-to-print";
import moment from "moment";
import styled from "styled-components";
import { Button, Divider, InputNumber, message, Modal, Typography } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, DollarOutlined, SwapOutlined, WalletOutlined } from "@ant-design/icons";
import { CREATE_CHANGE_ORDER } from "../../services";
import { formatNumber, getUserDataFromLCStorage } from "../../utils/helper";
import useEnterKeyHandler from "./component/useEnterKeyHandler";
import routes from "../../utils/routes";

const { Title, Text } = Typography;

// Types and Interfaces
interface PosPayment {
  orderId?: string;
  order_no?: string;
  newOrderList: any[];
  changeOrderList: any[];
  beforeOrderList: any[];
  isPayments: boolean;
  onClose: () => void;
  exchange: { bath?: number; usd?: number; cny?: number };
}

interface TotalPay {
  cash_lak: number;
  cash_bath: number;
  cash_usd: number;
  transfer_lak: number;
  transfer_bath: number;
  transfer_usd: number;
  amount: number;
}

type PaymentType = "CASH" | "TRANSFER" | "CASH_AND_TRANSFER";

// Styled Components
const ModalContent = styled.div`
  padding: 16px;
`;

const StatusBanner = styled.div<{ status: "positive" | "negative" | "neutral" }>`
  background-color: ${({ status }) => 
    status === "positive" ? "#52c41a" : 
    status === "negative" ? "#f5222d" : "#1890ff"};
  color: white;
  padding: 16px;
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const PaymentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin: 16px 0;
`;

const PaymentOption = styled(Button)<{ $isActive: boolean }>`
  height: 54px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  ${({ $isActive }) => $isActive && `
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  `}
`;

const PaymentForm = styled.div`
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const InputGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 3fr;
  align-items: center;
  margin-bottom: 12px;
`;

const InputLabel = styled(Text)`
  text-align: right;
  padding-right: 12px;
  font-size: 16px;
`;

const StyledInputNumber = styled(InputNumber)`
  width: 100%;
  .ant-input-number-input {
    font-size: 16px;
  }
`;

const QuickCashOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

const QuickCashButton = styled(Button)`
  min-width: 120px;
`;

const ActionRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 3fr 1fr;
  gap: 12px;
  margin-top: 16px;
`;

const ExactAmountButton = styled(Button)<{ $isActive: boolean }>`
  ${({ $isActive }) => $isActive && `
    background-color: #52c41a;
    color: white;
    &:hover, &:focus {
      background-color: #52c41a;
      color: white;
    }
  `}
`;

const PrintContainer = styled.div`
  display: none;
`;

// Component
const PosPayementChange: React.FC<PosPayment> = ({
  orderId,
  order_no,
  newOrderList,
  changeOrderList,
  beforeOrderList,
  isPayments,
  onClose,
  exchange,
}) => {
  const navigate = useNavigate();
  const branchInfo = getUserDataFromLCStorage();
  const printComponentRef = useRef<HTMLDivElement>(null);
  const reactToPrintContent = useRef<any>(null);

  const [typePay, setTypePay] = useState<PaymentType | null>(null);
  const [totalPay, setTotalPay] = useState<TotalPay>({
    cash_lak: 0,
    cash_bath: 0,
    cash_usd: 0,
    transfer_lak: 0,
    transfer_bath: 0,
    transfer_usd: 0,
    amount: 0,
  });
  const [isExactAmount, setIsExactAmount] = useState(false);

  const [createOrderChange, { loading }] = useMutation(CREATE_CHANGE_ORDER);

  // Calculate totals
  const sumNewOrder = newOrderList.reduce((acc, item) => acc + (item.order_total_price || 0), 0);
  const sumChangeOrder = changeOrderList.reduce((acc, item) => acc + (item.order_total_price || 0), 0);
  const sumTotalChange = sumNewOrder - sumChangeOrder;
  const totalPriceCost = newOrderList.reduce((acc, item) => acc + item.order_qty * item.price_cost, 0);

  // Calculate total amount in LAK
  useEffect(() => {
    const rates = { 
      cash_lak: 1, 
      cash_bath: exchange.bath || 1, 
      cash_usd: exchange.usd || 1, 
      transfer_lak: 1, 
      transfer_bath: exchange.bath || 1, 
      transfer_usd: exchange.usd || 1 
    };
    
    const newAmount = Object.entries(rates).reduce(
      (acc, [key, rate]) => acc + (totalPay[key as keyof TotalPay] || 0) * rate, 
      0
    );
    
    setTotalPay((prev) => ({ ...prev, amount: newAmount }));
  }, [totalPay.cash_lak, totalPay.cash_bath, totalPay.cash_usd, 
      totalPay.transfer_lak, totalPay.transfer_bath, totalPay.transfer_usd, 
      exchange]);

  // Reset payment fields when payment type changes
  useEffect(() => {
    setTotalPay({
      cash_lak: typePay === "CASH" && isExactAmount ? sumTotalChange : 0,
      cash_bath: 0,
      cash_usd: 0,
      transfer_lak: typePay === "TRANSFER" && isExactAmount ? sumTotalChange : 0,
      transfer_bath: 0,
      transfer_usd: 0,
      amount: 0,
    });
  }, [typePay, isExactAmount, sumTotalChange]);

  const changeAmount = totalPay.amount - sumTotalChange;
  const isInsufficient = changeAmount < 0;

  const handleQuickCash = (value: number) => {
    if (!typePay) {
      message.warning("ກະລຸນາເລືອກປະເພດການຊຳລະກ່ອນ");
      return;
    }
    
    const field = typePay === "TRANSFER" ? "transfer_lak" : "cash_lak";
    setTotalPay((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAndPrint = async () => {
    if (loading) return;
    
    if (!typePay) {
      message.warning("ກະລຸນາເລືອກປະເພດການຊຳລະກ່ອນບັນທຶກ");
      return;
    }
    
    if (totalPay.amount < sumTotalChange) {
      message.error("ຈຳນວນເງິນບໍ່ພຽງພໍ");
      return;
    }

    const orderData = {
      orderId,
      order_no,
      branchId: branchInfo?.branchId?.id,
      branchName: branchInfo?.branchId?.branchName,
      oldItem: beforeOrderList,
      newChangeItem: newOrderList,
      changeItem: changeOrderList,
      totalOriginPriceNewItem: totalPriceCost,
      totalOldOrder: beforeOrderList.reduce((acc, item) => acc + (item.order_total_price || 0), 0),
      totalNewOrder: sumNewOrder,
      toalChangeOrder: sumChangeOrder,
      amountAddOnNewOrder: sumTotalChange,
      send_back_customer: changeAmount,
      cash_lak: totalPay.cash_lak,
      transfer_lak: totalPay.transfer_lak,
      typePay,
    };

    try {
      const result = await createOrderChange({ variables: { data: orderData } });
      if (result?.data?.createChangeOrder?.id) {
        message.success("ປ່ຽນເຄື່ອງສຳເລັດ");
        reactToPrintContent.current?.handlePrint();
        onClose();
        navigate(routes.REPORT_DASHBOARD);
      }
    } catch (error) {
      message.error("ກະລຸນາລອງໃໝ່");
      console.error("Error:", error);
    }
  };

  useEnterKeyHandler(handleSaveAndPrint, isPayments);

  // Payment options with icons
  const paymentOptions = [
    { value: "CASH" as PaymentType, label: "ເງິນສົດ", icon: <DollarOutlined /> },
    { value: "TRANSFER" as PaymentType, label: "ເງິນໂອນ", icon: <WalletOutlined /> },
    { value: "CASH_AND_TRANSFER" as PaymentType, label: "ສົດ ແລະ ໂອນ", icon: <SwapOutlined /> },
  ];

  // Quick cash options
  const quickCashOptions = [50000, 100000, 150000, 200000, 250000, 300000];

  // Get banner status
  const getBannerStatus = (): "positive" | "negative" | "neutral" => {
    if (changeAmount > 0) return "positive";
    if (isInsufficient) return "negative";
    return "neutral";
  };

  // Get banner icon
  const getBannerIcon = () => {
    if (changeAmount > 0) return <CheckCircleOutlined />;
    if (isInsufficient) return <CloseCircleOutlined />;
    return null;
  };

  // Get banner text
  const getBannerText = () => {
    if (changeAmount > 0) return `ເງິນທອນ: ${formatNumber(changeAmount)} ກີບ`;
    if (isInsufficient) return `ເງິນບໍ່ພໍ: ${formatNumber(Math.abs(changeAmount))} ກີບ`;
    return `ຕ້ອງຮັບ: ${formatNumber(sumTotalChange)} ກີບ`;
  };

  // Render input field
  const renderInput = (label: string, field: keyof TotalPay, disabled: boolean = false) => (
    <InputGroup>
      <InputLabel>{label}:</InputLabel>
      <StyledInputNumber
        size="large"
        min={0}
        value={totalPay[field]}
        onChange={(value) => setTotalPay((prev) => ({ ...prev, [field]: value || 0 }))}
        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        parser={(value) => parseFloat(value?.replace(/,/g, "") || "0")}
        disabled={disabled}
      />
    </InputGroup>
  );

  return (
    <Modal 
      open={isPayments} 
      footer={null} 
      width={720} 
      closable={false}
      centered
      bodyStyle={{ padding: 0 }}
    >
      <ModalContent>
        {/* Status Banner */}
        <StatusBanner status={getBannerStatus()}>
          {getBannerIcon()}
          {getBannerText()}
        </StatusBanner>

        {/* Payment Options */}
        <Title level={5}>ປະເພດການຊໍາລະ</Title>
        <PaymentGrid>
          {paymentOptions.map((option) => (
            <PaymentOption
              key={option.value}
              type={typePay === option.value ? "primary" : "default"}
              onClick={() => setTypePay(option.value)}
              $isActive={typePay === option.value}
              size="large"
              icon={option.icon}
            >
              {option.label}
            </PaymentOption>
          ))}
        </PaymentGrid>

        {/* Payment Form */}
        {typePay && (
          <PaymentForm>
            {(typePay === "CASH" || typePay === "CASH_AND_TRANSFER") && (
              <>
                <Title level={5}>ຈ່າຍດ້ວຍເງິນສົດ</Title>
                {renderInput("ສົດກີບ", "cash_lak")}
                {renderInput("ສົດບາດ", "cash_bath")}
                {renderInput("ສົດໂດລາ", "cash_usd")}
                <Divider />
              </>
            )}
            
            {(typePay === "TRANSFER" || typePay === "CASH_AND_TRANSFER") && (
              <>
                <Title level={5}>ຈ່າຍດ້ວຍເງິນໂອນ</Title>
                {renderInput("ໂອນກີບ", "transfer_lak")}
                {renderInput("ໂອນບາດ", "transfer_bath")}
                {renderInput("ໂອນໂດລາ", "transfer_usd")}
              </>
            )}
            
            <QuickCashOptions>
              <Title level={5} style={{ width: "100%", marginBottom: 8 }}>ຈຳນວນເງິນດ່ວນ</Title>
              {quickCashOptions.map((value) => (
                <QuickCashButton 
                  key={value} 
                  onClick={() => handleQuickCash(value)}
                >
                  {formatNumber(value)} ກີບ
                </QuickCashButton>
              ))}
            </QuickCashOptions>
          </PaymentForm>
        )}

        {/* Action Buttons */}
        <ActionRow>
          <ExactAmountButton
            size="large"
            onClick={() => setIsExactAmount(!isExactAmount)}
            $isActive={isExactAmount}
            icon={isExactAmount ? <CheckCircleOutlined /> : null}
          >
            ຈຳນວນພໍດີ
          </ExactAmountButton>
          
          <Button
            type="primary"
            size="large"
            onClick={handleSaveAndPrint}
            loading={loading}
            disabled={isInsufficient || !typePay}
            icon={<DollarOutlined />}
          >
            ຮັບເງິນ ແລະ ພິມໃບຮັບເງິນ
          </Button>
          
          <Button 
            size="large" 
            onClick={onClose}
            icon={<CloseCircleOutlined />}
          >
            ປິດ
          </Button>
        </ActionRow>

        {/* Print Component (Hidden) */}
        <PrintContainer>
          <ReactToPrint
            content={() => printComponentRef.current}
            ref={reactToPrintContent}
          />
          <div ref={printComponentRef}>
            <Bill
              newOrderList={newOrderList}
              order_no={order_no}
              sumTotalPrice={sumNewOrder}
              branchInfo={branchInfo}
              changeAmount={changeAmount}
              sumTotalChange={sumTotalChange}
            />
          </div>
        </PrintContainer>
      </ModalContent>
    </Modal>
  );
};

// Bill Component
interface BillProps {
  newOrderList: any[];
  order_no?: string;
  sumTotalPrice: number;
  branchInfo: any;
  changeAmount: number;
  sumTotalChange: number;
}

const BillContainer = styled.div`
  font-family: "Phetsarath OT";
  padding: 10px;
  font-size: 14px;
`;

const BillHeader = styled.div`
  text-align: center;
  border-bottom: 1px dashed gray;
  padding-bottom: 8px;
`;

const BillInfo = styled.div`
  margin: 8px 0;
`;

const BillItem = styled.div`
  margin: 4px 0;
`;

const BillItemDetails = styled.div`
  display: flex;
  justify-content: space-between;
  padding-left: 10px;
`;

const BillSummary = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 2px 0;
`;

const BillFooter = styled.div`
  text-align: center;
  margin-top: 10px;
`;

const Bill: React.FC<BillProps> = ({
  newOrderList,
  order_no,
  sumTotalPrice,
  branchInfo,
  changeAmount,
  sumTotalChange,
}) => (
  <BillContainer>
    <BillHeader>
      <strong>ຮ້ານມິນິມາກ ສວນເສືອປ່າ</strong>
      <div>ສາຂາ {branchInfo?.branchId?.branchName}</div>
      <div>ພະນັກງານ: {branchInfo?.firstName} {branchInfo?.lastName}</div>
    </BillHeader>
    
    <BillInfo>
      <div>ເລກບິນ: {order_no}</div>
      <div>ວັນທີ: {moment().format("DD-MM-YYYY HH:mm")}</div>
    </BillInfo>
    
    <Divider dashed style={{ margin: 0 }} />
    
    {newOrderList.map((item, index) => (
      <BillItem key={item?.id || index}>
        <div>{index + 1}. {item?.productName || "-"}</div>
        <BillItemDetails>
          <span>
            ({formatNumber(item?.order_qty || 0)} x {formatNumber(item?.price_sale || 0)})
          </span>
          <span>{formatNumber(item?.order_total_price || 0)}</span>
        </BillItemDetails>
      </BillItem>
    ))}
    
    <Divider dashed style={{ margin: "4px 0" }} />
    
    <BillSummary>
      <span>ລວມ:</span>
      <strong>{formatNumber(sumTotalPrice)} ກີບ</strong>
    </BillSummary>
    
    <BillSummary>
      <span>ຊຳລະຕົວຈິງ:</span>
      <strong>{formatNumber(sumTotalChange)} ກີບ</strong>
    </BillSummary>
    
    <BillSummary>
      <span>ເງິນທອນ:</span>
      <strong>{formatNumber(changeAmount)} ກີບ</strong>
    </BillSummary>
    
    <BillFooter>ຂໍຂອບໃຈ</BillFooter>
  </BillContainer>
);

export default PosPayementChange;