import React, { memo, useMemo } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component"; // เพิ่ม dependency นี้
import "react-lazy-load-image-component/src/effects/blur.css"; // เพิ่ม effect ถ้าต้องการ
import styled from "styled-components";
import { consts } from "../../utils";
import { convertStatusStockBox, formatDate } from "../../utils/helper";

// Styled Components
const InfoContainer = styled.div`
  padding: 16px;
  background: #ffffff;
  border-radius: 8px;
`;

const ProductImage = styled(LazyLoadImage)`
  border-radius: 8px;
  border: 1px solid #e8ecef;
  object-fit: cover;
  margin-bottom: 16px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(120px, 1fr) 2fr;
  gap: 12px;
  font-size: 14px;
`;

const Label = styled.div`
  font-weight: 600;
  color: #595959;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
`;

const Value = styled.div`
  color: #1a1a1a;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  word-break: break-word;
`;

interface Props {
  data: any | Record<string, any>;
}

const StockBoxInfo: React.FC<Props> = ({ data }) => {
  // Memoized formatNumber function
  const formatNumber = useMemo(
    () => (num?: number) => num?.toLocaleString("th-TH") || "0",
    []
  );

  // Memoized image URL
  const imageUrl = useMemo(
    () =>
      data?.stockCenterId?.productId?.image
        ? `${consts.URL_PHOTO_AW3}${data.stockCenterId?.productId.image}`
        : "/pos-logo.png",
    [data?.stockCenterId?.productId?.image]
  );

  // Memoized data object to avoid re-computation
  const displayData = useMemo(
    () => ({
      productName: data?.stockCenterId?.productName || "N/A",
      boxNo: data?.boxNo || "N/A",
      status: data?.status || "N/A",
      exportBy: data?.exportBy || "N/A",
      exportDate: formatDate(data?.exportDate),
      amount: formatNumber(data?.amount),
      amountLimit: formatNumber(data?.amountLimit),
      details: data?.details || "N/A",
    }),
    [
      data?.stockCenterId?.productName,
      data?.boxNo,
      data?.exportBy,
      data?.exportDate,
      data?.amount,
      data?.amountLimit,
      data?.details,
      data?.status,
      formatNumber,
      formatDate,
    ]
  );

  return (
    <InfoContainer>
      <ProductImage
        src={imageUrl}
        alt={displayData.productName}
        width={100}
        height={100}
        placeholder={
          <div style={{ width: 100, height: 100, background: "#f0f0f0" }} />
        }
        effect="blur" // Optional: เพิ่ม effect ขณะโหลด
      />

      <InfoGrid>
        <Label>ຊື່ສິນຄ້າ</Label>
        <Value>{displayData.productName}</Value>

        <Label>ລະຫັດຖົງ</Label>
        <Value>{displayData.boxNo}</Value>

        <Label>ສະຖານະ</Label>
        <Value>{convertStatusStockBox(displayData.status)}</Value>


        <Label>ຜູ້ນຳອອກ</Label>
        <Value>{displayData.exportBy}</Value>

        <Label>ວັນທີນຳອອກ</Label>
        <Value>{displayData.exportDate}</Value>

        <Label>ຈຳນວນໃນຖົງ</Label>
        <Value>{displayData.amount}</Value>

        <Label>ຈຳນວນບັນຈຸ</Label>
        <Value>{displayData.amountLimit}</Value>


        <Label>ລາຍລະອຽດ</Label>
        <Value>{displayData.details}</Value>
      </InfoGrid>
    </InfoContainer>
  );
};

// Export with memo to prevent unnecessary re-renders
export default memo(StockBoxInfo, (prevProps, nextProps) => {
  // Custom comparison to deeply check data object
  return (
    prevProps.data === nextProps.data ||
    JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)
  );
});
