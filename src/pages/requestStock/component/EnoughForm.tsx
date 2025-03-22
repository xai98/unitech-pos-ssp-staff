import { Button, Flex, Form, InputNumber, message, Modal, Select } from "antd";
import React, { useState } from "react";
import { GiConfirmed } from "react-icons/gi";
import { UPDATE_ITEM_REQUEST_STOCK } from "../../../services";
import { useMutation } from "@apollo/client";

interface Props {
  open: boolean;
  data: any;
  onCancel: () => void;
  refetch: () => void;
}

const EnoughForm: React.FC<Props> = ({ open, data, onCancel, refetch }) => {
  const [updateData, { loading: updateLoading }] = useMutation(
    UPDATE_ITEM_REQUEST_STOCK,
    {
      onCompleted: () => {
        refetch();
        onCancel();
      },
    }
  );

  const [formData, setFormData] = useState({
    typeAmount: "",
    amountChecked: 0,
  });

  const handleConfirm = async () => {
    try {
      if (!data?.id) {
        return message.error("ຂໍ້ມູນບໍ່ຖືກຕ້ອງ, ບໍ່ພົບ ID");
      }
      if (!formData.typeAmount)
        return message.warning("ກະລຸນາເລືອກປະເພດຈຳນວນບໍ່ຄົບ/ເກີນ");
      if (formData.amountChecked === 0)
        return message.warning("ກະລຸນາເລືອກປ້ອນຈຳນວນຫຼຸດ ຫຼື ເກີນ");
      if (updateLoading) return;
      await updateData({
        variables: {
          data: {
            status: "NOT_CORRECT_AMOUNT",
            ...formData,
          },
          where: {
            id: data?.id ?? "",
          },
        },
      });

      message.success("ຢືນຢັນເຄື່ອງບໍ່ຄົບສຳເລັດ");

      setFormData({
        typeAmount: "",
        amountChecked: 0,
      });
    } catch (error) {
      message.error("ການດຳເນີນການລົ້ມແຫລວ ກະລຸນາກວດຂໍ້ມູນສິນຄ້າຄືນ");
    }
  };
  return (
    <>
      <Modal
        title="ຢືນຢັນເຄື່ອງບໍ່ຄົບຕາມຈຳນວນ"
        open={open}
        footer={null}
        onCancel={onCancel}
      >
        <Form.Item
          label="ເລືອກປະເພດຈຳນວນບໍ່ຄົບ/ເກີນ"
          style={{ margin: 0 }}
          layout="vertical"
        >
          <Select
            style={{
              width: "100%",
            }}
            value={formData?.typeAmount}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, typeAmount: value }))
            }
            size="large"
            placeholder="ກະລຸນາເລືອກ"
            options={[
              {
                value: "",
                label: "ສະແດງທຸກສະຖານະ",
              },
              {
                value: "NOT_ENOUGH",
                label: "ຫຼຸດຈຳນວນ",
              },
              {
                value: "OVERDUE",
                label: "ເກີນຈຳນວນ",
              },
            ]}
          />
        </Form.Item>

        <div style={{ height: 10 }}></div>

        <Form.Item
          label="ກຳນົດຄ່າຄອມມິດຊັ່ນ"
          layout="vertical"
          rules={[
            {
              required: false,
              type: "number",
              message: "ກະລຸນາປ້ອນປ້ອນຈຳນວນເງິນ!",
            },
          ]}
          style={{ margin: 0 }}
        >
          <InputNumber
            size="large"
            autoComplete="off"
            placeholder="ກະລຸນາປ້ອນປ້ອນຈຳນວນເງິນ"
            style={{ width: "100%" }}
            value={formData?.amountChecked}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) =>
              value ? parseFloat(value.replace(/(,*)/g, "")) : 0
            }
            onChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                amountChecked: Number(value),
              }))
            }
          />
        </Form.Item>
        <div style={{ height: 30 }}></div>

        <Flex justify="end" align="center">
          <Button
            type="primary"
            htmlType="button"
            icon={<GiConfirmed />}
            onClick={handleConfirm}
            style={{ backgroundColor: "#1976d2", width: "100%" }}
            size="large"
          >
            ຢືນຢັນ
          </Button>
        </Flex>
      </Modal>
    </>
  );
};

export default EnoughForm;
