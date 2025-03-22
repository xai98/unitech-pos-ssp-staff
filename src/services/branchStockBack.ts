import { gql } from "apollo-boost";

export const CREATE_BRANCH_STOCK_BACK_MANY = gql`
mutation CreateBranchStockMany($data: BranchStockInputMany) {
  createBranchStockMany(data: $data) {
    count
    total
  }
}
`;


export const UPDATE_STOCK_BRANCH_BACK_MANY = gql`
mutation UpdateBranchStockMany($data: UpdateBranchStockMany) {
  updateBranchStockMany(data: $data) {
    count
    total
  }
}
`;


export const UPDATE_SHOW_BRANCH_STOCK = gql`
mutation UpdateBranchStockIsShow($data: BranchStockInput!, $where: StockWhereInputOne!) {
  updateBranchStockIsShow(data: $data, where: $where) {
    id
  }
}

`;


export const DELETE_BRANCH_STOCK_BACK = gql`
mutation DeleteBranchStock($where: BranchStockWhereInputOne!) {
  deleteBranchStock(where: $where) {
    id
  }
}
`;


export const UPDATE_COMMISSION_BRANCH_STOCK = gql`
mutation UpdateBranchStockCommissions($data: BranchStockInput!, $where: StockWhereInputOne!) {
  updateBranchStockCommissions(data: $data, where: $where) {
    id
  }
}
`;




export const EXPORT_BRANCH_STOCK_ONE = gql`
mutation ExportBranchStockOne($data: BranchStockInput!, $where: StockWhereInputOne!) {
  exportBranchStockOne(data: $data, where: $where) {
    id
    productName
  }
}
`


export const GET_BRANCH_STOCK_BACK_LISTS = gql`
query BranchStocks($where: StockWhereInput, $orderBy: OrderByInput, $skip: Int, $limit: Int) {
  branchStocks(where: $where, orderBy: $orderBy, skip: $skip, limit: $limit) {
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

` 