import { gql } from "@apollo/client";

export const LOGIN = gql`
  mutation LoginEmployee($data: LoginInput!) {
    loginEmployee(data: $data) {
      accessToken
      data {
        id
        username
        phone
        firstName
        lastName
        email
        birthday
        role
        gender
        maritualStatus
        branchId {
          id
          branchName
        }
        branchName
      }
    }
  }
`;