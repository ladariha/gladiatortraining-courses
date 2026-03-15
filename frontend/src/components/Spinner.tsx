import { ProgressSpinner } from "primereact/progressspinner";
import React from "react";

export const Spinner: React.FC = () => {
  return (
    <div className="w-full text-center">
      <ProgressSpinner />
    </div>
  );
};
