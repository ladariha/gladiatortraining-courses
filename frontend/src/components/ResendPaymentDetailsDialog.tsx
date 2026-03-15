import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import React from "react";
import { common } from "../messages";
import { InputText } from "primereact/inputtext";
import { isValidEmail } from "../utils";
import { useResendPaymentDetails } from "../hooks/useResendPaymentDetails";

type Props = {
  close: () => void;
  groupId: number;
};

export const ResendPaymentDetailsDialog: React.FC<Props> = ({ groupId, close }) => {
  const { resendPaymentDetails, isLoading } = useResendPaymentDetails();
  const [resendEmail, setResendEmail] = React.useState<string>();

  const footerContent = (
    <div>
      <Button
        label={common.cancel}
        icon="pi pi-times"
        onClick={close}
        className="p-button-text"
      />
      <Button
        label={common.send}
        icon="pi pi-check"
        loading={isLoading}
        disabled={isLoading || !isValidEmail(resendEmail)}
        onClick={async () => {
          if (isValidEmail(resendEmail)) {
            await resendPaymentDetails(groupId, resendEmail as string);
            close();
          }
        }}
        autoFocus={true}
      />
    </div>
  );

  return (
    <Dialog
      visible={true}
      style={{ width: "50vw" }}
      onHide={close}
      footer={footerContent}
    >
      <p className="m-0">
        {common.resendPaymentDetails}
        <div className="flex flex-column gap-2">
          <label htmlFor="resend-email">{common.confirmEmail}</label>
          <InputText
            id="resend-email"
            required={true}
            value={resendEmail}
            onChange={(evt) => setResendEmail(evt.target.value)}
          />
        </div>
      </p>
    </Dialog>
  );
};
