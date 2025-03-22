import { gql } from "@apollo/client";

// Queries
export const GET_TRANSACTION = gql`
  query Transaction($where: TransactionWhereInputOne!) {
    transaction(where: $where) {
      id
      branchId
      branch_name
      amount
      type
      categoryTransactionId
      categoryTransaction {
        id
        name
        type
      }
      payment_method
      transaction_date
      description
      isDeleted
      createdAt
    }
  }
`;

export const GET_TRANSACTIONS = gql`
  query Transactions(
    $where: TransactionWhereInput
    $orderBy: OrderByInput
    $skip: Int
    $limit: Int
  ) {
    transactions(
      where: $where
      orderBy: $orderBy
      skip: $skip
      limit: $limit
    ) {
      total
      data {
        id
        branchId
        branch_name
        amount
        type
        categoryTransactionId
        categoryTransaction {
          id
          name
          type
        }
        payment_method
        transaction_date
        description
        isDeleted
        createdAt
      }
    }
  }
`;

// Mutations
export const CREATE_TRANSACTION = gql`
  mutation CreateTransaction($data: TransactionInput!) {
    createTransaction(data: $data) {
      id
      branchId
      branch_name
      amount
      type
      categoryTransactionId
      categoryTransaction {
        id
        name
        type
      }
      payment_method
      transaction_date
      description
      isDeleted
      createdAt
    }
  }
`;

export const UPDATE_TRANSACTION = gql`
  mutation UpdateTransaction(
    $data: TransactionInput!
    $where: TransactionWhereInputOne!
  ) {
    updateTransaction(data: $data, where: $where) {
      id
      branchId
      branch_name
      amount
      type
      categoryTransactionId
      categoryTransaction {
        id
        name
        type
      }
      payment_method
      transaction_date
      description
      isDeleted
      createdAt
    }
  }
`;

export const DELETE_TRANSACTION = gql`
  mutation DeleteTransaction($where: TransactionWhereInputOne!) {
    deleteTransaction(where: $where) {
      id
    }
  }
`;

