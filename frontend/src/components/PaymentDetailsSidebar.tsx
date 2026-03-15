import React from "react";
import { common } from "../messages";
import { Registration, RegistrationEvent } from "../types";
import { Sidebar } from "primereact/sidebar";
import { Spinner } from "./Spinner";

type Props = {
  event: RegistrationEvent;
  leaderRegistration: Registration;
  onHide: () => void;
};
export const PaymentDetailsSidebar: React.FC<Props> = ({ event, leaderRegistration, onHide }) => {
  const [isLoadingQrCode, setIsLoadingQrCode] = React.useState<boolean>(true);

  const variableSymbol = `${`${event.id}`.padStart(3, "0")}${`${leaderRegistration.id}`.padStart(7, "0")}`;
  const messageForRecepient = `${leaderRegistration.name} ${leaderRegistration.last_name}`;

  const getQrImage = () => {
    const prefix = event.prefix ? `accountPrefix=${event.prefix}&` : "";

    return `http://api.paylibo.com/paylibo/generator/czech/image?${prefix}accountNumber=${event.account_number}&size=240&bankCode=${event.bank_code}&amount=${
      leaderRegistration.price
    }&currency=CZK&vs=${variableSymbol}&message=${encodeURIComponent(messageForRecepient)}`;
  };

  return (
    <Sidebar
      visible={true}
      onHide={onHide}
      position="right"
      className="w-full md:w-12 lg:w-6"
    >
      <h2>{common.payment}</h2>
      <div className="flex flex-column">
        <ul>
          <li>
            <strong>{common.price}:&nbsp;</strong>
            {leaderRegistration.price}&nbsp;Kč
          </li>
          {event.prefix && (
            <li>
              <strong>{common.prefix}:&nbsp;</strong>
              {event.prefix}
            </li>
          )}
          <li>
            <strong>{common.accountNumber}:&nbsp;</strong>
            {event.account_number}
          </li>
          <li>
            <strong>{common.bankCode}:&nbsp;</strong>
            {event.bank_code}
          </li>
          <li>
            <strong>{common.variableSymbolRequired}:&nbsp;</strong>
            {variableSymbol}
          </li>
          <li>
            <strong>{common.recepientMsg}:&nbsp;</strong>
            {messageForRecepient}
          </li>
          {event.iban && (
            <li>
              <strong>{common.iban}:&nbsp;</strong>
              {event.iban}
            </li>
          )}
          {event.swift && (
            <li>
              <strong>{common.swift}:&nbsp;</strong>
              {event.swift}
            </li>
          )}
        </ul>
        {isLoadingQrCode && <Spinner />}
        <div className="align-self-center text-center">
          <h4>{common.qr}</h4>
          <p className="text-red-600">{common.qrWarning}</p>
          <img
            onLoad={() => setIsLoadingQrCode(false)}
            src={getQrImage()}
          />
        </div>
      </div>
    </Sidebar>
  );
};
