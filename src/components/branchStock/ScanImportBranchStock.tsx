import { Input, InputRef, message, Modal } from "antd";
import React, {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ScanImportStockProps } from "../../types/branchStock";
import styled from "styled-components";
import { useLazyQuery, useMutation } from "@apollo/client";
import { BRANCH_ACCEPT_STOCK_BOX, GET_SCAN_STOCK_BOX } from "../../services";
import { getUserDataFromLCStorage } from "../../utils/helper";
import { StyledButton } from "../../styles/GlobalStyle";
import { FcAcceptDatabase } from "react-icons/fc";

const StockBoxInfo = lazy(
  () => import("../../components/branchStock/StockBoxInfo")
);

const StyledInput = styled(Input)`
  border-radius: 6px;
  margin-bottom: 24px;
  padding: 8px 12px;
`;

const ScanImportBranchStock: React.FC<ScanImportStockProps> = ({
  open,
  handleCancel,
  refetch,
}) => {
  const branchInfo = useMemo(() => getUserDataFromLCStorage(), []);
  const inputRef = useRef<InputRef>(null);
  const [barcode, setBarcode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [branchAcceptStockBox, { loading: updateLoading }] = useMutation(
    BRANCH_ACCEPT_STOCK_BOX,
    {
      onCompleted: () => {
        message.success(`ຮັບເຄື່ອງສຳເລັດ`);
      },
      onError: (error) => {
        message.error(`ແຈ້ງເຕືອນ: ${error.message}`);
        inputRef.current?.focus();
      },
    }
  );

  const [loadStockBox, { data }] = useLazyQuery(GET_SCAN_STOCK_BOX, {
    fetchPolicy: "network-only",
    onError: (error) => {
      message.warning(`ແຈ້ງເຕືອນ: ${error.message}`);
      inputRef.current?.focus();
    },
  });

  const handleScan = useCallback(
    async (barcodeValue: string) => {
      if (!barcodeValue) {
        message.error("ກະລຸນາສະແກນບາໂຄ້ດສິນຄ້າ");
        return;
      }

      setIsLoading(true);
      try {
        await loadStockBox({
          variables: {
            where: {
              boxNo: barcodeValue,
              branchId: branchInfo?.branchId?.id,
            },
          },
        });
      } finally {
        setIsLoading(false);
        setBarcode("");
        inputRef.current?.focus();
      }
    },
    [loadStockBox, branchInfo]
  );

  // Effect for barcode scanner
  useEffect(() => {
    if (!open) return;

    let buffer = "";
    let timeout: NodeJS.Timeout;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (!/[a-zA-Z0-9]/.test(e.key)) return;
      buffer += e.key;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (buffer.length === 12 || buffer.length === 13) {
          handleScan(buffer);
        }
        buffer = "";
      }, 100);
    };

    window.addEventListener("keypress", handleKeyPress, { passive: true });
    return () => {
      window.removeEventListener("keypress", handleKeyPress);
      clearTimeout(timeout);
    };
  }, [handleScan, open]);

  // Effect for auto-focusing input when modal opens
  useEffect(() => {
    if (open && inputRef.current) {
      // ใช้ setTimeout เพื่อรอให้ Modal render เสร็จ
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100); // Delay เล็กน้อยเพื่อให้ DOM พร้อม

      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleAcceptStock = useCallback(async () => {
    if (!data?.stockBoxByBoxNo) {
      return message.warning("ກະລຸນາສະແກນບາໂຄ້ດຮັບເຄື່ອງກ່ອນ");
    }

    try {
      const stockBox = data?.stockBoxByBoxNo;
      await branchAcceptStockBox({
        variables: {
          data: {
            stockCenterId: stockBox?.stockCenterId?.id,
            amount: stockBox?.amount,
            branchId: branchInfo?.branchId?.id,
          },
          where: {
            id: stockBox?.id,
          },
        },
      });
    } catch (error) {
      message.error("ເກີດຂໍ້ຜິດພາດໃນການຮັບເຄື່ອງ");
    } finally {
      refetch();
      handleCancel();
    }
  }, [
    branchAcceptStockBox,
    data?.stockBoxByBoxNo,
    refetch,
    message,
    branchInfo,
    handleCancel,
  ]);

  const stockBoxContent = useMemo(() => {
    return data?.stockBoxByBoxNo ? (
      <Suspense fallback={<div>ກຳລັງໂຫລດ...</div>}>
        <StockBoxInfo data={data.stockBoxByBoxNo} />

        {data?.stockBoxByBoxNo?.status === "export" && (
          <StyledButton
            block
            size="large"
            onClick={handleAcceptStock}
            loading={updateLoading}
            color="blue"
          >
            <FcAcceptDatabase /> ກົດຮັບເຄື່ອງ
          </StyledButton>
        )}
      </Suspense>
    ) : null;
  }, [data?.stockBoxByBoxNo]);

  return (
    <Modal
      title="ສະແກນບາໂຄດຮັບເຄື່ອງ"
      open={open}
      onCancel={handleCancel}
      footer={null}
      destroyOnClose
      afterOpenChange={(visible) => {
        if (visible) {
          inputRef.current?.focus();
        }
      }}
    >
      <StyledInput
        ref={inputRef}
        placeholder="ສະແກນເພື່ອຮັບເຄື່ອງ..."
        size="large"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        onPressEnter={() => handleScan(barcode)}
        disabled={isLoading}
        allowClear
        // ลบ autoFocus ออก เพราะเราจะจัดการด้วย useEffect
      />
      {stockBoxContent}
    </Modal>
  );
};

export default ScanImportBranchStock;
