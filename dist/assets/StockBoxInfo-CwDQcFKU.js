import{r as l,d as x,c as j,f as t,j as e,a as b,b as N}from"./index-GY5TW3T7.js";const I=x.div`
  padding: 16px;
  background: #ffffff;
  border-radius: 8px;
`,k=x(N.LazyLoadImage)`
  border-radius: 8px;
  border: 1px solid #e8ecef;
  object-fit: cover;
  margin-bottom: 16px;
`,y=x.div`
  display: grid;
  grid-template-columns: minmax(120px, 1fr) 2fr;
  gap: 12px;
  font-size: 14px;
`,i=x.div`
  font-weight: 600;
  color: #595959;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
`,c=x.div`
  color: #1a1a1a;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  word-break: break-word;
`,L=({data:o})=>{var p,m,f;const n=l.useMemo(()=>s=>(s==null?void 0:s.toLocaleString("th-TH"))||"0",[]),g=l.useMemo(()=>{var s,u,h;return(u=(s=o==null?void 0:o.stockCenterId)==null?void 0:s.productId)!=null&&u.image?`${j.URL_PHOTO_AW3}${(h=o.stockCenterId)==null?void 0:h.productId.image}`:"/pos-logo.png"},[(m=(p=o==null?void 0:o.stockCenterId)==null?void 0:p.productId)==null?void 0:m.image]),r=l.useMemo(()=>{var s;return{productName:((s=o==null?void 0:o.stockCenterId)==null?void 0:s.productName)||"N/A",boxNo:(o==null?void 0:o.boxNo)||"N/A",status:(o==null?void 0:o.status)||"N/A",exportBy:(o==null?void 0:o.exportBy)||"N/A",exportDate:t(o==null?void 0:o.exportDate),amount:n(o==null?void 0:o.amount),amountLimit:n(o==null?void 0:o.amountLimit),details:(o==null?void 0:o.details)||"N/A"}},[(f=o==null?void 0:o.stockCenterId)==null?void 0:f.productName,o==null?void 0:o.boxNo,o==null?void 0:o.exportBy,o==null?void 0:o.exportDate,o==null?void 0:o.amount,o==null?void 0:o.amountLimit,o==null?void 0:o.details,o==null?void 0:o.status,n,t]);return e.jsxs(I,{children:[e.jsx(k,{src:g,alt:r.productName,width:100,height:100,placeholder:e.jsx("div",{style:{width:100,height:100,background:"#f0f0f0"}}),effect:"blur"}),e.jsxs(y,{children:[e.jsx(i,{children:"ຊື່ສິນຄ້າ"}),e.jsx(c,{children:r.productName}),e.jsx(i,{children:"ລະຫັດຖົງ"}),e.jsx(c,{children:r.boxNo}),e.jsx(i,{children:"ສະຖານະ"}),e.jsx(c,{children:b(r.status)}),e.jsx(i,{children:"ຜູ້ນຳອອກ"}),e.jsx(c,{children:r.exportBy}),e.jsx(i,{children:"ວັນທີນຳອອກ"}),e.jsx(c,{children:r.exportDate}),e.jsx(i,{children:"ຈຳນວນໃນຖົງ"}),e.jsx(c,{children:r.amount}),e.jsx(i,{children:"ຈຳນວນບັນຈຸ"}),e.jsx(c,{children:r.amountLimit}),e.jsx(i,{children:"ລາຍລະອຽດ"}),e.jsx(c,{children:r.details})]})]})},S=l.memo(L,(o,n)=>o.data===n.data||JSON.stringify(o.data)===JSON.stringify(n.data));export{S as default};
