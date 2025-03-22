import { gql } from "@apollo/client";

// Queries
export const GET_CATEGORY_TRANSACTION = gql`
  query CategoryTransaction($where: CategoryTransactionWhereInputOne!) {
    categoryTransaction(where: $where) {
      id
      name
      type
      description
      isActive
      isDeleted
      createdAt
    }
  }
`;

export const GET_CATEGORY_TRANSACTIONS = gql`
  query CategoryTransactions(
    $where: CategoryTransactionWhereInput
    $orderBy: OrderByInput
    $skip: Int
    $limit: Int
  ) {
    categoryTransactions(
      where: $where
      orderBy: $orderBy
      skip: $skip
      limit: $limit
    ) {
      total
      data {
        id
        name
        type
        description
        isActive
        isDeleted
        createdAt
      }
    }
  }
`;

// Mutations
export const CREATE_CATEGORY_TRANSACTION = gql`
  mutation CreateCategoryTransaction($data: CategoryTransactionInput!) {
    createCategoryTransaction(data: $data) {
      id
      name
      type
      description
      isActive
      isDeleted
      createdAt
    }
  }
`;

export const UPDATE_CATEGORY_TRANSACTION = gql`
  mutation UpdateCategoryTransaction(
    $data: CategoryTransactionInput!
    $where: CategoryTransactionWhereInputOne!
  ) {
    updateCategoryTransaction(data: $data, where: $where) {
      id
      name
      type
      description
      isActive
      isDeleted
      createdAt
    }
  }
`;

export const DELETE_CATEGORY_TRANSACTION = gql`
  mutation DeleteCategoryTransaction($where: CategoryTransactionWhereInputOne!) {
    deleteCategoryTransaction(where: $where) {
      id
    }
  }
`;

