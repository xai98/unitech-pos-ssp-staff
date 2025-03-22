import React from 'react';
import { Button } from "antd";

interface InteractiveButton {
  label: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  loading?: boolean;
  htmlType?: "button" | "submit" | "reset";
  type?: "primary" | "dashed" | "link" | "text" | "default",
  style:any;
  color?: "red" | "green" | "blue" | "pink"
}

const ButtonAction: React.FC<InteractiveButton> = ({ style,label, onClick, disabled = false, loading = false,htmlType = 'submit',type='primary', }) => {
  return (
    <div>
      <Button
        type={type}
        htmlType={htmlType}
        onClick={onClick}
        style={{ width: '100%',...style }}
        disabled={disabled || loading}
        loading={loading}
        size="large"
        className="login-form-button"
        >
        {loading ? 'ກຳລັງດຳເນີນການ' : label}
      </Button>
    </div>
  );
};

export default ButtonAction;
