import * as _ from "lodash";

import { consts } from "../utils";
import moment from "moment";
import { Tag } from "antd";

export const parseJwt = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
};

// get user data from localStorage
export const getUserDataFromLCStorage = () => {
  const userData = localStorage.getItem(consts.USER_KEY);
  if (!userData) return false;
  const user = JSON.parse(userData || "");
  return user;
};

export const useAuth = () => {
  const userData = getUserDataFromLCStorage();
  //  check if user login or not
  const isAuthenticated = !_.isEmpty(userData);
  return isAuthenticated;
};

// ฟังก์ชันเปลี่ยนรูปแบบตัวเลขให้มีคอมม่าคั่นหลักพัน
export const formatNumber = (value: number): string => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// ฟังก์ชันเปลี่ยนรูปแบบวันที่
export const formatDate = (date: Date): string => {
  return moment(date).format("DD-MM-YYYY HH:mm a");
};

export const formatDateFilter = (dateTime: Date) => {
  const thaiTimezone = moment(dateTime).format("YYYY-MM-DD");

  return thaiTimezone;
  // // moment.locale("lo");
  // let resp = moment(dateTime).format("DD-MM-YYYY, HH:mm");
  // return resp;
};

export const currentDate = () => {
  let startDate = formatDateFilter(new Date());
  let endDate = formatDateFilter(new Date()); //2023-09-14
  return { startDate, endDate };
};

export const addOneDate = (date?: string) => {
  const parsedDate = moment.utc(date);
  if (!parsedDate.isValid()) {
    return "Invalid date";
  }
  let newDate = parsedDate.add(1, "days").format("YYYY-MM-DD");
  return newDate;
};

export const generateBill = () => {
  const generateOrderId = `VIXAY-${moment(new Date()).format(
    "YYMMDDHHmmss"
  )}-${Math.floor(Math.random() * 100)}`;
  return generateOrderId;
};

export const converTypePay = (typePay: string) => {
  let res = "";
  switch (typePay) {
    case "CASH":
      res = "ເງິນສົດ";
      break;
    case "TRANSFER":
      res = "ເງິນໂອນ";
      break;
    case "CASH_AND_TRANSFER":
      res = "ເງິນສົດ ແລະ ເງິນໂອນ";
      break;
    default:
      res = ""; // If the provided field name doesn't match any of the cases, return an empty string.
      break;
  }
  return res;
};

export const converStatusHistory = (status: string) => {
  let res = "";
  switch (status) {
    case "IMPORT_STOCK":
      res = "ນຳເຂົ້າ";
      break;
    case "EXPORT_STOCK":
      res = "ນຳອອກ";
      break;
    case "SALE_STOCK":
      res = "ຂາຍອອກ";
      break;
    default:
      res = ""; // If the provided field name doesn't match any of the cases, return an empty string.
      break;
  }
  return res;
};

export const convertStatusRequestStock = (status: string) => {
  let res = "";
  switch (status) {
    case "APPROVED":
      res = "ຮັບຮູ້ການສັ່ງເຄື່ອງ";
      break;
    case "SUCCESS":
      res = "ສັ່ງເຄື່ອງສຳເລັດ";
      break;
    case "REQUESTING":
      res = "ພ/ງ ສັ່ງເຄື່ອງໃໝ່";
      break;
    case "REJECTED":
      res = "ປະຕິເສດການສັ່ງເຄື່ອງ";
      break;
    case "SEND_REQUESTING":
      res = "ພ/ງ ຢືນຢັນການສົ່ງຂໍ";
      break;
    case "REQUESTING_CANCEL":
      res = "ພ/ງ ຂໍຍົກເລິກ";
      break;
    case "READY_UPDATE_STOCK":
      res = "ພ້ອມອັບເດດສະຕ໋ອກສາຂາ";
      break;
    case "UPDATE_STOCK_SUCCESS":
      res = "ອັບເດດສະຕ໋ອກສາຂາແລ້ວ";
      break;
    default:
      res = ""; // If the provided field name doesn't match any of the cases, return an empty string.
      break;
  }
  return res;
};

export const convertStatus = (status: string) => {
  switch (status) {
    case "REQUESTING":
      return (
        <Tag bordered={false} color="orange">
          ກຳລັງສ້າງລາຍການຮ້ອງຂໍ
        </Tag>
      );
    case "SEND_REQUESTING":
      return (
        <Tag bordered={false} color="blue">
          ພ/ງ ຢືນຢັນການສົ່ງຂໍ
        </Tag>
      );
    case "REQUESTING_CANCEL":
      return (
        <Tag bordered={false} color="volcano">
          ພ/ງ ຂໍຍົກເລິກ
        </Tag>
      );
    case "APPROVED":
      return (
        <Tag bordered={false} color="green">
          ຮັບຮູ້ການສັ່ງເຄື່ອງ
        </Tag>
      );

    case "READY_UPDATE_STOCK":
      return (
        <Tag bordered={false} color="green">
          ພ້ອມອັບເດດສະຕ໋ອກສາຂາ
        </Tag>
      );
    case "UPDATE_STOCK_SUCCESS":
      return (
        <Tag bordered={false} color="blue">
          ອັບເດດສະຕ໋ອກສາຂາແລ້ວ
        </Tag>
      );
    case "SUCCESS":
      return (
        <Tag bordered={false} color="success">
          ສັ່ງເຄື່ອງສຳເລັດ
        </Tag>
      );
    case "REJECTED":
      return (
        <Tag bordered={false} color="red">
          ປະຕິເສດການສັ່ງເຄື່ອງ
        </Tag>
      );
    default:
      return "";
  }
};

export const requestStatus = [
  "REQUESTING",
  "SEND_REQUESTING",
  "REQUESTING_CANCEL",
  "APPROVED",
  "READY_UPDATE_STOCK",
  "UPDATE_STOCK_SUCCESS",
  "SUCCESS",
  "REJECTED",
];

export const textLength = (text: string, maxLength: number) => {
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + "...";
  }
  return text;
};

export const convertStatusItemRequest = (status: string) => {
  switch (status) {
    case "PENDING":
      return (
        <Tag bordered={false} color="orange">
          ກຳລັງດຳເນີນ
        </Tag>
      );
    case "CORRECT_AMOUNT":
      return (
        <Tag bordered={false} color="success">
          ຄົບຕາມຈຳນວນ
        </Tag>
      );
    case "NOT_CORRECT_AMOUNT":
      return (
        <Tag bordered={false} color="red">
          ບໍ່ຄົບຕາມຈຳນວນ
        </Tag>
      );
    case "NOT_HAVE":
      return (
        <Tag bordered={false} color="red">
          ບໍ່ມີເຄື່ອງ
        </Tag>
      );
    default:
      return "";
  }
};

export const convertTypeItemRequest = (status: string) => {
  switch (status) {
    case "PENDING":
      return (
        <Tag bordered={false} color="blue">
          ກຳລັງດຳເນີນ
        </Tag>
      );
    case "ENOUGH":
      return (
        <Tag bordered={false} color="success">
          ຕົງຈຳນວນ
        </Tag>
      );
    case "NOT_ENOUGH":
      return (
        <Tag bordered={false} color="red">
          ຫຼຸດ
        </Tag>
      );
    case "OVERDUE":
      return (
        <Tag bordered={false} color="orange">
          ເກີນ
        </Tag>
      );

    case "NOT_HAVE":
      return (
        <Tag bordered={false} color="red">
          ບໍ່ມີເຄື່ອງ
        </Tag>
      );

    default:
      return "";
  }
};



export const convertStatusStockBox = (status: string) => {
  switch (status) {
    case "ready":
      return (
        <Tag bordered={false} color="green">
          ພ້ອມໃຊ້ງານ
        </Tag>
      );
    case "export":
      return (
        <Tag bordered={false} color="orange">
          ນຳອອກແລ້ວ
        </Tag>
      );
    case "branch_accept":
      return (
        <Tag bordered={false} color="blue">
          ສາຂາໄດ້ຮັບແລ້ວ
        </Tag>
      );

    default:
      return "";
  }
};
