export const calculatediscount = (
    typeDiscount: string,
    value: number | null,
    sumTotalPrice: number,
    exchange: {
      bath?: number;
      usd?: number;
    }
  ): { lak: number; bath: number; usd: number } => {
    // ตรวจสอบว่า value ไม่เป็น null หรือ undefined ก่อนเริ่มการคำนวณ
    if (value === null || value === undefined) {
      return {
        lak: Math.round(sumTotalPrice),
        bath: Math.round(sumTotalPrice / (exchange?.bath || 1)),
        usd: Math.round(sumTotalPrice / (exchange?.usd || 1)),
      };
    }
  
    // คำนวณราคารวมในแต่ละสกุลเงิน
    const _lak = sumTotalPrice;
    const _bath = sumTotalPrice / (exchange?.bath || 1);
    const _usd = sumTotalPrice / (exchange?.usd || 1);
  
    let discount: { lak: number; bath: number; usd: number };
  
    // คำนวณส่วนลดตามประเภท
    if (typeDiscount === "PERCENT") {
      discount = {
        lak: Math.round(_lak - (_lak * value) / 100),
        bath: Math.round(_bath - (_bath * value) / 100),
        usd: Math.round(_usd - (_usd * value) / 100),
      };
    } else {
      // Assuming 'value' is in LAK and needs to be converted to BATH and USD
      discount = {
        lak: Math.round(_lak - value),
        bath: Math.round(_bath - value / (exchange?.bath || 1)),
        usd: Math.round(_usd - value / (exchange?.usd || 1)),
      };
    }
  
  
    return discount;
  };
  