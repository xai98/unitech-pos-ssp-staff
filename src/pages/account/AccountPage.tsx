import React, { useState } from "react";
import styled from "styled-components";
import { message, Button } from "antd";
import { Branch, CategoryTransaction, Transaction } from "../../types/account";
import TransactionList from "../../components/account/TransactionList";
import TransactionForm from "../../components/account/TransactionForm";

const Container = styled.div`
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const AccountPage: React.FC = () => {
  const [branches] = useState<Branch[]>([
    { id: "1", name: "สาขา 1" },
    { id: "2", name: "สาขา 2" },
  ]);
  const [categories, setCategories] = useState<CategoryTransaction[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [editTransaction, setEditTransaction] = useState<
    Transaction | undefined
  >(undefined);
  const [transactionModalVisible, setTransactionModalVisible] = useState(false);

  const handleCreateTransaction = async (values: Partial<Transaction>) => {
    try {
      console.log("values-->", values);
      setTransactions([]);
      setCategories([]);
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการบันทึกธุรกรรม");
    }
  };

  const openTransactionModal = (transaction?: Transaction) => {
    setEditTransaction(transaction);
    setTransactionModalVisible(true);
  };

  return (
    <Container>
      <h1>ຈັດການບັນຊີຮ້ານ</h1>

      <Header>
        <h2>ລາຍການເຮັດທຸລະກຳ</h2>
        <Button type="primary" onClick={() => openTransactionModal()}>
          ບັນທຶກທຸລະກຳໃໝ່
        </Button>
      </Header>
      <TransactionList
        transactions={transactions}
        onEdit={openTransactionModal}
      />
      <TransactionForm
        visible={transactionModalVisible}
        branches={branches}
        categories={categories}
        initialValues={editTransaction}
        onSubmit={handleCreateTransaction}
        onCancel={() => setTransactionModalVisible(false)}
      />
    </Container>
  );
};

export default AccountPage;
