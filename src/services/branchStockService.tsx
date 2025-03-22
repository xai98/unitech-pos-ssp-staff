import { gql } from "apollo-boost";

export const CREATE_REQUEST_STOCK = gql`
  mutation CreateRequestStock($data: RequestStockInput!) {
    createRequestStock(data: $data) {
      id
    }
  }
`;

export const UPDATE_STOCK_SHOW = gql`
  mutation UpdateNoShow($data: StockInput!, $where: StockWhereInputOne!) {
    updateNoShow(data: $data, where: $where) {
      id
    }
  }
`;

export const CATEGORIES = gql`
  query Categorys($where: CategoryWhereInput, $skip: Int, $limit: Int) {
    categorys(where: $where, skip: $skip, limit: $limit) {
      total
      data {
        id
        categoryName
        note
        createdBy
        updatedBy
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_BRANCH_STOCK = gql`
  query Stock($where: StockWhereInputOne!) {
    stock(where: $where) {
      id
      categoryId {
        id
        categoryName
      }
      productId {
        id
        image
        colorName
        size
        price_cost
        price_sale
      }
      branchId {
        id
        branchName
      }
      commissionStatus
      commission
      barcode
      productName
      amount
      note
      isShowSale
      createdBy
      updatedBy
      createdAt
      updatedAt
      deletedBy
      deletedAt
      isDeleted
    }
  }
`;

export const GET_BRANCH_STOCKS = gql`
  query Stocks(
    $where: StockWhereInput
    $orderBy: OrderByInput
    $skip: Int
    $limit: Int
  ) {
    stocks(where: $where, orderBy: $orderBy, skip: $skip, limit: $limit) {
      total
      data {
        id
        categoryId {
          id
          categoryName
        }
        productId {
          id
          image
          colorName
          size
          price_cost
          price_sale
        }
        branchId {
          id
          branchName
        }
        noShow
        commissionStatus
        commission
        barcode
        productName
        amount
        note
        isShowSale
        createdBy
        updatedBy
        createdAt
        updatedAt
        deletedBy
        deletedAt
        isDeleted
      }
    }
  }
`;

export const HISTORY_STOCKS = gql`
  query Historystocks(
    $where: HistoryStockWhereInput
    $orderBy: OrderByInput
    $skip: Int
    $limit: Int
  ) {
    historystocks(
      where: $where
      orderBy: $orderBy
      skip: $skip
      limit: $limit
    ) {
      total
      data {
        branchId {
          branchName
          id
          code
        }
        createdAt
        createdBy
        currentAmount
        deletedAt
        deletedBy
        id
        inAmount
        note
        oldAmount
        outAmount
        productId {
          id
          image
          productName
        }
        productName
        status
        updatedAt
        updatedBy
      }
    }
  }
`;

export const GET_REQUEST_STOCKS = gql`
  query RequestStocks(
    $where: RequestStockWhereInput
    $orderBy: OrderByInput
    $skip: Int
    $limit: Int
  ) {
    requestStocks(
      where: $where
      orderBy: $orderBy
      skip: $skip
      limit: $limit
    ) {
      total
      data {
        id
        branchId {
          id
          branchName
        }
        status
        requestBy
        approvedBy
        dateApproved
        historyUpdate {
          status
          updatedAt
          updatedBy
        }
        items {
          id
          productName
          amountRequest
          amountApproved
        }
        note
        createdBy
        updatedBy
        createdAt
        updatedAt
        deletedBy
        deletedAt
      }
    }
  }
`;


export const GET_REQUEST_STOCK = gql`
query RequestStock($where: RequestStockWhereInputOne!) {
  requestStock(where: $where) {
    id
    branchId {
      id
      branchName
    }
    status
    requestBy
    approvedBy
    dateApproved
    historyUpdate {
      status
      updatedAt
      updatedBy
    }
    items {
      id
      requestStockId {
        id
      }
      categoryId {
        id
        categoryName
      }
      productId {
        id
        productName
        price_sale
        image
      }
      branchId {
        id
        branchName
      }
      productName
      amount
      amountRequest
      amountApproved
      status
      typeAmount
      amountChecked
      note
      createdBy
      updatedBy
      createdAt
      updatedAt
      deletedBy
      deletedAt
    }
    note
    createdBy
    updatedBy
    createdAt
    updatedAt
    deletedBy
    deletedAt
  }
}
`


export const UPDATE_ITEM_REQUEST_STOCK = gql`
mutation UpdateItemRequestStock($data: ItemRequestStockInput!, $where: ItemRequestStockWhereInputOne!) {
  updateItemRequestStock(data: $data, where: $where) {
    id
  }
}
`;


export const DELETE_ITEM_REQUEST_STOCK = gql`
mutation DeleteItemRequestStock($where: ItemRequestStockWhereInputOne!) {
  deleteItemRequestStock(where: $where) {
    id
  }
}
`;


export const UPDATE_STATUS_REQUEST_STOCK = gql`
mutation UpdateStatusRequestStock($data: RequestStockInput!, $where: RequestStockWhereInputOne!) {
  updateStatusRequestStock(data: $data, where: $where) {
    id
  }
}
`

export const UPDATE_ADD_REQUEST_STOCK = gql`
mutation UpdateAddRequestStock($data: RequestStockInput!, $where: RequestStockWhereInputOne!) {
  updateAddRequestStock(data: $data, where: $where) {
    id
  }
}
`;
