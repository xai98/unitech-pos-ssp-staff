
import { gql } from "apollo-boost";


export const GET_HISTORY_BRANCH_STOCKS = gql`
query HistoryBranchstocks($where: HistoryBranchStockWhereInput, $orderBy: OrderByInput, $skip: Int, $limit: Int) {
  historyBranchstocks(where: $where, orderBy: $orderBy, skip: $skip, limit: $limit) {
    total
    data {
      id
      branchId {
        id
        branchName
      }
      productId {
        id
        productName
        image
      }
      productName
      status
      oldAmount
      inAmount
      outAmount
      currentAmount
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
`