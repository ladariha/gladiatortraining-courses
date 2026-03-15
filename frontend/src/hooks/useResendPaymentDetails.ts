import { ToastContext } from "../context/ToastContext";
import React from "react";
import { errors, common } from "../messages";
import { RestRoutes, getDefaultHeaders } from "../rest";

export const useResendPaymentDetails = () => {
  const { showMessage } = React.useContext(ToastContext);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const resendPaymentDetails = React.useCallback(
    async (groupId: number, email: string) => {
      try {
        setIsLoading(true);
        const response = await fetch(`${RestRoutes.mail}/payment`, {
          method: "POST",
          headers: { ...getDefaultHeaders(), "content-type": "application/json" },
          body: JSON.stringify({
            groupId,
            email,
          }),
        });
        if (!response.ok) {
          throw new Error("Oops");
        }
        showMessage({
          severity: "success",
          summary: common.sent,
        });
      } catch (e) {
        showMessage({
          severity: "error",
          summary: common.error,
          detail: errors.email,
        });
        setIsLoading(false);
      }
      setIsLoading(false);
    },
    [showMessage]
  );

  return { resendPaymentDetails, isLoading };
};
