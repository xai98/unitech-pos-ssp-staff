import { message } from "antd";
import React, { createContext, useContext, useState } from "react";

type OrderSuccessType = {
  orderId?: string;
  orderNo?: string;
  finallyPrice?: number;
};


type Exchange ={
  bath: number;
  usd: number;
  cny:number
}


type ContextType = {
  cart: any[];
  setCart: (value: any) => void;
  totalOrder: number;
  totalOrderPrice: number;
  addToCart: (product: any) => void;
  removeFromCart: (productId: string) => void;
  increaseQuantity: (product: string) => void;
  decreaseQuantity: (product: string) => void;
  clearCart: () => void;
  saveOrderSave: (data: any) => void;
  orderSuccess?: OrderSuccessType;
  clearOrderSuccess: () => void;
  messageList: any[];
  setMessageList: (data: any) => void;
  selectPage: string;
  setSelectPage: (data: string) => void;
  categoryData: any[];
  setCategoryData: (data: any) => void;
  totalCart: number;
  totalCommission: number;
  stockList: any[];
  setStockList: (data: any) => void;
  exchange:Exchange,
  setExchange: (data: Exchange) => void;
  totalOriginPrice:number;
};

const Context = createContext<ContextType | undefined>(undefined);

export const Provider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useState<any[]>([]);
  const [stockList, setStockList] = useState<any[]>([]);
  const [orderSuccess, setOrderSuccess] = useState<OrderSuccessType>({});
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [exchange, setExchange] = useState<Exchange>({bath: 0,usd: 0,cny:0});
  const [messageList, setMessageList] = useState<any[]>([]);
  const [selectPage, setSelectPage] = useState("");

  const addToCart = (product: any) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find(
        (item) => item.product === product.product
      );

      if (existingProduct) {
        // เพิ่มจำนวนสินค้า ถ้าสินค้านั้นมีอยู่ในกระต่าแล้ว
        return prevCart.map((item) =>
          item.product === product.product
            ? {
                ...item,
                quantity: item.quantity + 1,
                totalCosts: item.productCosts * (item.quantity + 1),
                total: item.productPrice * (item.quantity + 1),
              }
            : item
        );
      } else {
        // เพิ่มสินค้าชิ้นใหม่เข้ากระต่า
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const increaseQuantity = (productId: string) => {
    const findProduct = stockList?.find(
      (pro: any) => pro.productId?.id === productId
    );
    const findProductCard = cart?.find(
      (pro: any) => pro.productId === productId
    );
    
    if(findProductCard?.order_qty > findProduct.amount){
      return message.warning(`ຈຳນວນສິນຄ້າບໍ່ພຽງພໍສິນຄ້າຕົວຈິງຍັງເຫຼືອ ${findProduct.amount}`);
     }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productId === productId
          ? {
              ...item,
              order_qty: item.order_qty + 1,
              order_total_price: item.price_sale * (item.order_qty + 1),
              commission: findProduct?.commissionStatus
                ? findProduct.commission * (item.order_qty + 1)
                : 0,
            }
          : item
      )
    );
  };

  const decreaseQuantity = (productId: string) => {
    const findProduct = stockList?.find(
      (pro: any) => pro.productId?.id === productId
    );
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productId === productId && item.order_qty > 1
          ? {
              ...item,
              order_qty: item.order_qty - 1,
              order_total_price: item.price_sale * (item.order_qty - 1),
              commission: findProduct?.commissionStatus
              ? findProduct.commission * (item.order_qty - 1)
              : 0,
            }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.productId !== productId)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const saveOrderSave = (data: any) => {
    setOrderSuccess(data);
  };

  const clearOrderSuccess = () => {
    setOrderSuccess({});
  };

  const totalOrderPrice = cart.reduce(
    (acc, item) => acc + item.order_total_price,
    0
  );
  const totalOriginPrice = cart.reduce((acc, item) => acc + item.price_cost, 0);
  const totalOrder = cart.reduce((acc, item) => acc + item.order_qty, 0);
  const totalCommission = cart.reduce((acc, item) => acc + item.commission, 0);
  const totalCart = cart.length;

  return (
    <Context.Provider
      value={{
        totalOriginPrice,
        totalCommission,
        exchange, 
        setExchange,
        stockList,
        setStockList,
        categoryData,
        setCart,
        setCategoryData,
        selectPage,
        setSelectPage,
        messageList,
        setMessageList,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        totalOrder,
        totalOrderPrice,
        increaseQuantity,
        decreaseQuantity,
        saveOrderSave,
        orderSuccess,
        clearOrderSuccess,
        totalCart,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const context = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error("useCart must be used within a Provider");
  }
  return context;
};
