import { Message } from "primereact/message";
import React from "react";

export const EmptyMessage: React.FC<{ msg: string }> = ({ msg }) => {
  return (
    <div className="emptyMessage text-center">
      <Message
        severity="info"
        text={msg}
      />
    </div>
  );
};
