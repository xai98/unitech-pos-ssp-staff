import { Button } from "antd";
import styled from "styled-components";

  
export const StyledButton = styled(Button)`
  border-radius: 6px;
  height: 32px;
  width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  ${({ color }) => color === "green" && `
    background: #52c41a;
    border-color: #52c41a;
    color: white;
    &:hover, &:focus {
      background: #73d13d !important;
      border-color: #73d13d !important;
      color: white !important;
    }
  `}
  ${({ color }) => color === "blue" && `
    background: #1890ff;
    border-color: #1890ff;
    color: white;
    &:hover, &:focus {
      background: #40a9ff !important;
      border-color: #40a9ff !important;
      color: white !important;
    }
  `}
`;