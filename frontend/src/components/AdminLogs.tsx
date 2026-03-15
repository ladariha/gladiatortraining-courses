import React from "react";
import { useFetchLogs } from "../hooks/useFetchLogs";
import { Message } from "primereact/message";
import { common, errors } from "../messages";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Spinner } from "./Spinner";

export const AdminLogs: React.FC<{}> = () => {
  const { isLoading, error, logs } = useFetchLogs();

  return (
    <>
      {isLoading && <Spinner />}
      {!isLoading && error && (
        <Message
          severity="error"
          text={errors.logs}
        />
      )}
      {!isLoading && !error && logs && (
        <DataTable
          value={logs}
          paginator={true}
          dataKey="id"
          rows={50}
          size="small"
          emptyMessage={common.noLogs}
          className="mt-3"
        >
          <Column
            field="time"
            header={common.date}
          />
          <Column
            field="msg"
            header={common.name}
          />
        </DataTable>
      )}
    </>
  );
};
