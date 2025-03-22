import { gql } from "apollo-boost";

export const UPDATE_EXCHANGE = gql`
 mutation CreateExchangeRate($data: ExchangeRateInput!) {
  createExchangeRate(data: $data) {
    id
  }
}
`

export const GET_EXCHANGE = gql`
query ExchangeRate($where: ExchangeRateWhereInputOne!) {
    exchangeRate(where: $where) {
      id
      bath
      usd
      cny
      createdBy
      updatedBy
      deletedBy
      createdAt
      updatedAt
      deletedAt
    }
  }
`


