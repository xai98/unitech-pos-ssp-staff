export const generateOrderNo = (order: any) => {
    // ดึงหมายเลขสุดท้ายจาก order_no
    const parts = order.order_no; // แยกหมายเลขด้วย '-'
    // const parts = order.order_no.split('-'); // แยกหมายเลขด้วย '-'
    // const lastPart = parts[parts.length - 1]; // หมายเลขที่ต้องเพิ่มขึ้น
    // const codeBranch = order?.branchId?.code
    // ตรวจสอบว่าเป็นเลขที่มีลักษณะเป็นตัวเลข
    if (isNaN(parseInt(parts))) {
      throw new Error('หมายเลขคำสั่งซื้อล่าสุดไม่ถูกต้อง');
    }
    
    // เพิ่มค่าหมายเลขล่าสุด
    const newNumber = (parseInt(parts, 10) + 1).toString().padStart(8, '0'); // เพิ่ม 1 และจัดรูปแบบเป็น 8 หลัก
    
    // สร้างหมายเลขคำสั่งซื้อใหม่
    return `${newNumber}`;
  }
  
