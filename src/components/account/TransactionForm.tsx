import React from "react";
import { Modal, Form, Input, Button, Select, DatePicker } from "antd";
import styled from "styled-components";
import { Transaction, CategoryTransaction, Branch } from "../../types/account";

const { Option } = Select;

interface TransactionFormProps {
  visible: boolean;
  branches: Branch[];
  categories: CategoryTransaction[];
  initialValues?: Transaction;
  onSubmit: (values: Partial<Transaction>) => void;
  onCancel: () => void;
}

const StyledForm = styled(Form)`
  .ant-form-item {
    margin-bottom: 16px;
  }
`;

const TransactionForm: React.FC<TransactionFormProps> = ({
  visible,
  categories,
  initialValues,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm();

  const handleFinish = (values: any) => {
    values.transaction_date = values.transaction_date?.toISOString();
    onSubmit(values);
    form.resetFields();
  };

  return (
    <Modal
      title={initialValues ? "แก้ไขธุรกรรม" : "บันทึกธุรกรรมใหม่"}
      open={visible}
      onCancel={onCancel}
      footer={null}
    >
      <StyledForm
        form={form}
        initialValues={initialValues}
        onFinish={handleFinish}
        layout="vertical"
      >
        <Form.Item
          name="amount"
          label="ຈຳນວນເງິນ"
          rules={[{ required: true, message: "ກະລຸນາປ້ອນຈຳນວນເງິນ" }]}
        >
          <Input type="number" placeholder="ຕົວຢ່າງ 1000" />
        </Form.Item>
        <Form.Item
          name="type"
          label="ປະເພດ"
          rules={[{ required: true, message: "ກະລຸນາເລືອກປະເພດ" }]}
        >
          <Select placeholder="ເລືອກປະເພດ">
            <Option value="INCOME">ລາຍຮັບ</Option>
            <Option value="EXPENSE">ລາຍຈ່າຍ</Option>
          </Select>
        </Form.Item>
        <Form.Item name="categoryTransactionId" label="ໝວດໝູ່">
          <Select placeholder="ເລືອກໝວດໝູ່" allowClear>
            {categories.map((cat) => (
              <Option key={cat.id} value={cat.id}>
                {cat.name} ({cat.type === "INCOME" ? "ລາຍຮັບ" : "ລາຍຈ່າຍ"})
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="payment_method" label="ປະເພດຮັບເງິນ">
          <Input placeholder="เช่น เงินสด, โอน" />
        </Form.Item>
        <Form.Item name="transaction_date" label="วันที่">
          <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="description" label="คำอธิบาย">
          <Input.TextArea placeholder="รายละเอียดเพิ่มเติม" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
            {initialValues ? "อัพเดท" : "บันทึก"}
          </Button>
        </Form.Item>
      </StyledForm>
    </Modal>
  );
};

export default TransactionForm;