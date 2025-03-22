import React from "react";
import { Table, Tag } from "antd";
import styled from "styled-components";
import { Transaction } from "../../types/account";
import { ColumnsType } from "antd/es/table"; // นำเข้า ColumnsType จาก antd

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
}

const StyledTable = styled(Table)`
  .ant-table-thead > tr > th {
    background-color: #fafafa;
  }
`;

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
}) => {
  // กำหนด columns โดยใช้ ColumnsType<Transaction> เพื่อให้ TypeScript รู้ว่า dataSource เป็น Transaction[]
  const columns: ColumnsType<Transaction> = [
    {
      title: "ລຳດັບ",
      dataIndex: ["categoryTransaction", "name"], // Nested dataIndex
      key: "categoryTransaction",
      render: (value: string | undefined) => value || "-", // value จะเป็น string หรือ undefined
    },
    {
      title: "ລາຍລະອຽດ",
      dataIndex: ["categoryTransaction", "name"],
      key: "categoryTransactionDescription",
      render: (value: string | undefined) => value || "-",
    },
    {
      title: "ຈຳນວນເງິນ",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) =>
        amount.toLocaleString("th-TH", { minimumFractionDigits: 2 }),
    },
    {
      title: "ປະເພດ",
      dataIndex: "type",
      key: "type",
      render: (type: "INCOME" | "EXPENSE") => (
        <Tag color={type === "INCOME" ? "green" : "red"}>
          {type === "INCOME" ? "ລາຍຮັບ" : "ລາຍຈ່າຍ"}
        </Tag>
      ),
    },
    {
      title: "ໝວດໝູ່",
      dataIndex: ["categoryTransaction", "name"],
      key: "categoryTransactionName",
      render: (value: string | undefined) => value || "-",
    },
    {
      title: "ວັນທີ",
      dataIndex: "transaction_date",
      key: "transaction_date",
      render: (date?: string) =>
        date ? new Date(date).toLocaleDateString("th-TH") : "-",
    },
    {
      title: "ວັນທີສ້າງ",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString("th-TH"),
    },
    {
      title: "ຈັດການ",
      key: "action",
      render: (_: any, record: Transaction) => (
        <a onClick={() => onEdit(record)}>ແກ້ໄຂ</a>
      ),
    },
  ];

  return (
    <StyledTable<any> // กำหนด generic type ให้ StyledTable
      columns={columns}
      dataSource={transactions.filter((txn) => !txn.isDeleted)}
      rowKey="id"
      pagination={{ pageSize: 10 }}
    />
  );
};

export default TransactionList;