import { gql } from "apollo-boost";


export const BRANCH_ACCEPT_STOCK_BOX = gql`
mutation BranchAcceptStockBox($data: StockBoxInput!, $where: StockBoxWhereInputOne!) {
  branchAcceptStockBox(data: $data, where: $where) {
    id
  }
}
`


export const GET_SCAN_STOCK_BOX = gql`
query StockBoxByBoxNo($where: StockBoxWhereInputByBoxNo!) {
    stockBoxByBoxNo(where: $where) {
    id
    stockCenterId {
      id
      productName
      productId {
        id
        image
      }
    }
    branchId {
      id
      branchName
    }
    boxNo
    amountLimit
    amount
    status
    historyStatus {
      status
      updatedAt
      updatedBy
    }
    details
    exportDate
    exportBy
    acceptDate
    acceptBy
    createdBy
    updatedBy
    createdAt
    updatedAt
    deletedAt
  }
}
`;




