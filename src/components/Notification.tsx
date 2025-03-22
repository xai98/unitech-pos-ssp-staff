import { notification } from "antd";

type NotificationType = "success" | "info" | "warning" | "error";

interface ShowNotificationProps {
  type: NotificationType;
  title: string;
  description: string;
  duration?: number;
}

const showNotification = ({ type, title, description,duration = 3 }: ShowNotificationProps) => {
  notification[type]({
    message: title,
    description,
    duration
  });
};

export default showNotification;
