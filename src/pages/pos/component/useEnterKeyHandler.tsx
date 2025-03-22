import { useEffect } from "react";

const useEnterKeyHandler = (callback: () => void, payment: boolean) => {
  useEffect(() => {
    if (payment) {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          callback();
        }
      };

      window.addEventListener("keypress", handleKeyPress);

      return () => {
        window.removeEventListener("keypress", handleKeyPress);
      };
    }
  }, [callback,payment]);
};

export default useEnterKeyHandler;
