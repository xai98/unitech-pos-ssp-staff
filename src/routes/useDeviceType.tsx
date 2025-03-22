import { useEffect, useState } from "react";

export const useDeviceType = () => {
  const [deviceType, setDeviceType] = useState<string>("Unknown");

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();

    if (/mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent)) {
      setDeviceType("Mobile");
    } else if (/tablet|ipad/.test(userAgent)) {
      setDeviceType("Tablet");
    } else {
      setDeviceType("Desktop");
    }
  }, []);

  return deviceType;
};