import { useMutation } from "@apollo/client";
import { message, Modal } from "antd";
import { UPDATE_ITEM_REQUEST_STOCK } from "../../../services";
import { useState } from "react";

function CheckStatusItemRequest(refetch: () => void) {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [status, setStatus]=useState<string>("");

  const [updateData, { loading: updateLoading }] = useMutation(
    UPDATE_ITEM_REQUEST_STOCK,
    {
      onCompleted: () => {
        refetch();
      },
    }
  );

  const openConfirmModal = (data: any,status:string) => {
    setSelectedData(data);
    setStatus(status)
    setIsConfirmModalOpen(true);
  };

  const handleConfirm = async () => {
    try {
      if (!selectedData) return;
      if (updateLoading) return;

      await updateData({
        variables: {
          data: {
            status: status,
            amountChecked: status === 'NOT_HAVE' ? 0  : selectedData?.amountApproved,
            typeAmount: status === 'NOT_HAVE' ? 'NOT_HAVE' : "ENOUGH",
          },
          where: {
            id: selectedData.id,
          },
        },
      });

      message.success("ຢືນຢັນສຳເລັດ");
      setIsConfirmModalOpen(false);
    } catch (error: any) {
      message.error("ການດຳເນີນການລົ້ມແຫລວ ກະລຸນາກວດຂໍ້ມູນສິນຄ້າຄືນ");
    }
  };

  return {
    openConfirmModal,
    ConfirmModal: (
      <Modal
        title={status === 'NOT_HAVE' ? 'ຢືນຢັນເຄື່ອງບໍ່ມີ' :"ຢືນຢັນຈຳນວນເຄື່ອງຄົບ"}
        open={isConfirmModalOpen}
        onOk={handleConfirm}
        onCancel={() => setIsConfirmModalOpen(false)}
        okText="ຢືນຢັນ"
        cancelText="ຍົກເລີກ"
      >
        <p>ທ່ານຢືນຢັນວ່າຈຳນວນຖືກຕ້ອງ ຫຼື ບໍ່?</p>
      </Modal>
    ),
  };
}

export default CheckStatusItemRequest;
