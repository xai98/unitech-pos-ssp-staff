import { useLazyQuery, useMutation } from "@apollo/client";
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  Flex,
  Image,
  InputNumber,
  message,
  Modal,
  Row,
  Space,
  Spin,
  Table,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  DELETE_ITEM_REQUEST_STOCK,
  GET_REQUEST_STOCK,
  UPDATE_ITEM_REQUEST_STOCK,
  UPDATE_STATUS_REQUEST_STOCK,
} from "../../services";
import { convertStatus, convertStatusItemRequest, convertTypeItemRequest, formatDate } from "../../utils/helper";
import { consts } from "../../utils";
import { FiSend } from "react-icons/fi";
import { PiWarningCircleFill } from "react-icons/pi";
import { MdCancelScheduleSend } from "react-icons/md";
import {
  FaRegTrashAlt,
  FaEdit,
  FaRegSave,
  FaRegTimesCircle,
} from "react-icons/fa";
import { GiConfirmed } from "react-icons/gi";
import { IoMdAdd } from "react-icons/io";
import routes from "../../utils/routes";
import CheckStatusItemRequest from "./action/CheckStatusItemRequest";
import EnoughForm from "./component/EnoughForm";
import { CiNoWaitingSign } from "react-icons/ci";
import { ColumnsType } from "antd/es/table";

interface ItemData {
  id: string; // หรือ number ถ้า id เป็นตัวเลข
  [key: string]: any; // รองรับ properties อื่นๆ
}

function RequestStockDetail() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [itemList, setItemList] = useState<any[]>([]);
  
  const [isEnoughForm, setIsEnoughForm] = useState<{
    open: boolean;
    data: ItemData | null;
  }>({
    open: false,
    data: null,
  });

  const [updateData, { loading: updateLoading }] = useMutation(
    UPDATE_ITEM_REQUEST_STOCK
  );

  const [deleteData, { loading: deleteLoading }] = useMutation(
    DELETE_ITEM_REQUEST_STOCK
  );


  const [updateStatusRequestStock, { loading: updateStatusLoading }] =
    useMutation(UPDATE_STATUS_REQUEST_STOCK, {
      onCompleted: () => {
        message.success("ການສ້າງຂໍ້ມູນສຳເລັດ");
        loadRequestStock({
          fetchPolicy: "network-only",
          variables: {
            where: {
              id: requestId,
            },
          },
        });
      },
    });

  // GET_REQUEST_STOCK
  const [loadRequestStock, { data: dataRequestStock, loading,refetch }] =
    useLazyQuery(GET_REQUEST_STOCK);

  // const {confirmItemEnough} = CheckStatusItemRequest(refetch);
  const { openConfirmModal, ConfirmModal } = CheckStatusItemRequest(refetch);
  

  useEffect(() => {
    if (requestId) {
      loadRequestStock({
        fetchPolicy: "network-only",
        variables: {
          where: {
            id: requestId,
          },
        },
      });
    }
  }, [requestId]);

  useEffect(() => {
    if (dataRequestStock?.requestStock) {
      setItemList(dataRequestStock?.requestStock?.items);
    }
  }, [dataRequestStock?.requestStock]);

  const detailInfo = dataRequestStock && dataRequestStock?.requestStock;

  const actionButton = (data: any) => {
    return (
      <>
        <Button
          icon={<PiWarningCircleFill />}
          disabled={loading}
          size="small"
          type="primary"
          style={{ backgroundColor: "orange", borderColor: "orange" }}
          onClick={() => setIsEnoughForm({open:true, data})}
        >
          ບໍ່ຄົບ
        </Button>
        <Button
          icon={<GiConfirmed />}
          disabled={loading}
          size="small"
          type="primary"
          onClick={() => openConfirmModal(data,'CORRECT_AMOUNT')}
          style={{ backgroundColor: "green", borderColor: "green" }}
        >
          ຄົບ
        </Button>
        <Button
          icon={<CiNoWaitingSign />}
          disabled={loading}
          size="small"
          type="primary"
          onClick={() => openConfirmModal(data,'NOT_HAVE')}
          style={{ backgroundColor: "red", borderColor: "red" }}
        >
          ເຄື່ອງບໍ່ມີ
        </Button>
      </>
    );
  };


  const columns:ColumnsType<any> = [
    {
      title: "ລຳດັບ",
      dataIndex: "no",
      key: "no",
      width: "65px",
    },
    {
      title: "ຮູບ",
      dataIndex: "image",
      key: "image",
      width: "100px",
      render: (image: string) => (
        <Image
          src={consts.URL_PHOTO_AW3 + image}
          alt="image"
          style={{ width: 60 }}
        />
      ),
    },
    {
      title: "ຊື່ສິນຄ້າ",
      dataIndex: "productName",
      key: "productName",
      render: (productName: string, record: any) => (
        <div>
          <div>{productName}</div>
          <div style={{ color: "gray" }}>
            ລາຄາ:{record?.productId?.price_sale}
          </div>
        </div>
      ),
    },
    {
      title: "ຈ/ນຂໍເພີ່ມ",
      dataIndex: "record",
      key: "record",
      width: "100px",
      render: (_: any, record: any) => (
        <>
          {record?.edit ? (
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              placeholder="ປ້ອນຈຳນວນຕ້ອງການຂໍເພີ່ມສະຕ໋ອກ"
              value={record?.amountRequest || 0}
              onChange={(value) =>
                handleItemChange(record?.index, "amountRequest", value)
              }
            />
          ) : (
            record?.amountRequest
          )}
        </>
      ),
    },
    {
      title: "ຈ/ນໄດ້ຕົວຈິງ",
      dataIndex: "amountApproved",
      key: "amountApproved",
      width: "100px",
    },
    {
      title: "ສະຖານະ",
      dataIndex: "record",
      key: "record",
      // width: "150px",
      render: (_:any,record: any) => (
        <div>
          <div>ສະຖານະ: {convertStatusItemRequest(record?.status)}</div>
          <div>ປະເພດຈ/ນ: {convertTypeItemRequest(record?.typeAmount)}</div>
          <div>ຈຳນວນ: {record?.typeAmount === 'NOT_ENOUGH' ? <span style={{color:'red'}}>-{record?.amountChecked}</span> : record?.typeAmount === 'OVERDUE' ? <span style={{color:'green'}}>+{record?.amountChecked}</span> :  record?.amountChecked || 0}</div>
        </div>
      ),
    },

    {
      title: "ໝາຍເຫດ",
      dataIndex: "note",
      key: "note",
    },
    {
      title: "ຈັດການ",
      dataIndex: "record",
      key: "action",
      fixed: "right",
      render: (_: any, record: any, index: number) => (
        <Space>
          {detailInfo.status === "REQUESTING" && (
            <>
              {record?.edit ? (
                <>
                  <Button
                    onClick={() => handleSaveEdit(record, index)}
                    icon={<FaRegSave />}
                    type="primary"
                    style={{ backgroundColor: "green", borderColor: "green" }}
                  />
                  <Button
                    icon={<FaRegTimesCircle />}
                    onClick={() => handleEdit(index, false)}
                    danger
                    ghost
                  />
                </>
              ) : (
                <>
                  <Button
                    onClick={() => handleEdit(index, true)}
                    icon={<FaEdit />}
                    type="primary"
                  />
                  <Button
                    onClick={() => deleteItem(record, index)}
                    icon={<FaRegTrashAlt />}
                    danger
                    ghost
                  />
                </>
              )}
            </>
          )}

        {detailInfo.status === "SUCCESS" && record?.status === 'PENDING'  && actionButton(record)}

          
        </Space>
      ),
    },
  ];

  const data =
    itemList &&
    itemList?.map((item: any, index: number) => ({
      index,
      no: index + 1,
      ...item,
      image: item?.productId?.image,
    }));

  const handleItemChange = (index: number, key: keyof any, value: any) => {
    // const i = index?.index;
    // อัปเดตสถานะของ cartItems
    setItemList((prevItems) => {
      const updatedItems = [...prevItems];
      updatedItems[index] = { ...updatedItems[index], [key]: value };
      return updatedItems;
    });
    // setSelectedItems(updatedItems);
  };

  const handleEdit = (index: number, value: boolean) => {
    // TODO: edit item
    setItemList((prevItems) => {
      const updatedItems = [...prevItems];
      updatedItems[index] = { ...prevItems[index], edit: value };
      return updatedItems;
    });
  };

  const deleteItem = (record: any, index: number) => {
    Modal.confirm({
      title: "ຢືນຢັນການລຶບຂໍ້ມູນ",
      content: (
        <div>
          <div>
            ທ່ານຕ້ອງການລືບຂໍ້ມູນ{" "}
            <span style={{ color: "red" }}>{record?.productName}</span> ນີ້ແທ້
            ຫຼື ບໍ່?
          </div>

          <div style={{ height: 30 }}></div>
        </div>
      ),
      okText: "ລືບ",
      cancelText: "ປິດອອກ",
      okType: "danger",
      async onOk() {
        if (deleteLoading) return;

        const response = await deleteData({
          variables: {
            where: {
              id: record.id,
            },
          },
        });

        if (response?.data?.deleteItemRequestStock?.id) {
          const newCartItem = itemList.filter((_, i) => i !== index); // ลบรายการออกจาก array โดยใช้ index
          setItemList(newCartItem);
          message.success("ລຶບລາຍການສຳລັດ");
        }
      },
    });
  };

  const handleSaveEdit = async (record: any, index: number) => {
    try {
      if (updateLoading) return;

      const response = await updateData({
        variables: {
          data: {
            amountRequest: record?.amountRequest,
          },
          where: {
            id: record?.id,
          },
        },
      });

      if (response?.data?.updateItemRequestStock?.id) {
        setItemList((prevItems) => {
          const updatedItems = [...prevItems];
          updatedItems[index] = {
            ...updatedItems[index],
            amountRequest: record?.amountRequest,
            edit: false,
          };
          return updatedItems;
        });
      }
    } catch (err) {
      message.error("ແກ້ໄຂຈຳນວນບໍ່ສຳເລັດ");
    }
  };

  const handleActionRequest = (status: string) => {
    Modal.confirm({
      title:
        status === "SEND_REQUESTING"
          ? "ຢືນຢັນການສົ່ງຄຳຮ້ອງຂໍ"
          : "ຢືນຢັນການຍົກເລິກສົ່ງຮ້ອງຂໍ",
      content: (
        <div>
          <div>ທ່ານຕ້ອງການຢືນຢັນການສົ່ງຂໍ້ມູນນີ້ ແທ້ ຫຼື ບໍ່ ?</div>

          <div style={{ height: 30 }}></div>
        </div>
      ),
      okText: "ກົດເພື່ອຢືນຢັນ",
      cancelText: "ປິດອອກ",
      async onOk() {
        if (updateStatusLoading) return;

        await updateStatusRequestStock({
          variables: {
            data: {
              status: status,
            },
            where: {
              id: detailInfo.id,
            },
          },
        });
      },
    });
  };

  const onBack = () => {
    navigate(routes.HISTORY_REQUEST_STOCK_PAGE);
  };
  const addRequestStock = () => {
    navigate(routes.ADD_REQUEST_STOCK + "/" + detailInfo.id);
  };
  return (
    <div style={{margin:'10px'}}>
      <Spin size="large" spinning={loading} tip="ກຳລັງໂຫລດຂໍ້ມູນ...">
        <Flex justify="space-between" align="center">
          <Breadcrumb
            items={[
              {
                title: (
                  <a href="#" onClick={onBack}>
                    ປະຫວັດການເບີກສະຕ໋ອກ
                  </a>
                ),
              },
              {
                title: "ລາຍລະອຽດການຮ້ອງຂໍສະຕ໋ອກ",
              },
            ]}
          />
          <Space>
            {detailInfo?.status === "REQUESTING" && (
              <Button
                icon={<FiSend />}
                type="primary"
                onClick={() => handleActionRequest("SEND_REQUESTING")}
              >
                ນຳສົ່ງໃບເບີກເຄື່ອງ
              </Button>
            )}

            {detailInfo?.status === "SEND_REQUESTING" && (
              <Button
                icon={<MdCancelScheduleSend />}
                style={{ backgroundColor: "orange", borderColor: "orange" }}
                type="primary"
                onClick={() => handleActionRequest("REQUESTING")}
              >
                ແກ້ໄຂໃໝ່
              </Button>
            )}
          </Space>
        </Flex>

        <Row gutter={10} style={{ marginTop: 10 }}>
          <Col span={24}>
            <Card>
              <div style={{ fontSize: 18 }}>ລາຍລະອຽດ</div>
              <div style={{ height: 30 }}></div>

              <Flex justify="space-between" align="center">
                <div style={{ color: "gray" }}>ວັນທີແຈ້ງຂໍ</div>
                <div>{formatDate(detailInfo?.createdAt)}</div>
              </Flex>
              <div style={{ height: 10 }}></div>
              <Flex justify="space-between" align="center">
                <div style={{ color: "gray" }}>ຊື່ຜູ້ແຈ້ງ</div>
                <div>{detailInfo?.requestBy}</div>
              </Flex>
              <div style={{ height: 10 }}></div>
              <Flex justify="space-between" align="center">
                <div style={{ color: "gray" }}>ຜູ້ອະນຸມັດ</div>
                <div>{detailInfo?.approvedBy || "-"}</div>
              </Flex>
              <div style={{ height: 10 }}></div>
              <Flex justify="space-between" align="center">
                <div style={{ color: "gray" }}>ວັນທີແຈ້ງຂໍ</div>
                <div>
                  {detailInfo?.dateApproved
                    ? formatDate(detailInfo?.dateApproved)
                    : "-"}
                </div>
              </Flex>

              <div style={{ height: 10 }}></div>
              <Flex justify="space-between" align="center">
                <div style={{ color: "gray" }}>ສະຖານະ</div>
                <div>
                  {detailInfo?.status ? convertStatus(detailInfo?.status) : "-"}
                </div>
              </Flex>
            </Card>
          </Col>
          <Col span={24}>
            <Card>
              <Flex justify="space-between" align="center">
                <div style={{ fontSize: 18 }}>ລາຍການສິນຄ້າຂໍເພີ່ມສະຕ໋ອກ</div>

                {detailInfo?.status === "REQUESTING" && (
                  <Button
                    icon={<IoMdAdd />}
                    type="primary"
                    ghost
                    onClick={addRequestStock}
                  >
                    ເພີ່ມລາຍການ
                  </Button>
                )}
              </Flex>

              <div style={{ height: 10 }}></div>
              <Table
                columns={columns}
                dataSource={data}
                rowKey={"no"}
                pagination={false}
                // sticky={{
                //   offsetHeader: 60,
                // }}
                scroll={{ x: "max-content" }}
              />
            </Card>
          </Col>
        </Row>
      </Spin>

      {/* {enuoughForm()} */}

      <EnoughForm 
        open={isEnoughForm?.open} 
        data={isEnoughForm?.data} 
        onCancel = {() => setIsEnoughForm({open: false, data: null})}
        refetch={refetch}
       /> 

       {ConfirmModal}
    </div>
  );
}

export default RequestStockDetail;
