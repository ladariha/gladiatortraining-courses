import React from "react";
import { Message } from "primereact/message";
import { admin, common, errors } from "../messages";

import { Asterisk } from "./Asterisk";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useSetApiKey } from "../hooks/useSetApiKey";

export const AdminApiKeys: React.FC<{ close: () => void }> = ({ close }) => {
  const { error, submit, isCreated } = useSetApiKey();
  // eslint-disable-next-line no-null/no-null
  const formRef = React.useRef<HTMLFormElement>(null);

  const submitForm = () => {
    if (!formRef.current) {
      return;
    }
    const formData = new FormData(formRef.current);
    submit({
      name: formData.get("name")?.toString() || "",
      value: formData.get("value")?.toString() || "",
    });
  };

  React.useEffect(() => {
    if (isCreated) {
      close();
    }
  }, [isCreated]);

  return (
    <>
      <div className="card flex justify-content-center">
        <form
          ref={formRef}
          className="flex flex-column gap-2"
        >
          <label htmlFor="name">
            {common.name}
            <Asterisk />
          </label>
          <InputText
            defaultValue={""}
            className="w-full"
            name="name"
            id="name"
          />
          <InputText
            defaultValue={""}
            className="w-full"
            name="value"
            id="value"
          />
          <Button
            type="button"
            onClick={submitForm}
            label={admin.setKey}
          />
          {error && (
            <Message
              severity="error"
              text={errors.keys}
            />
          )}
        </form>
      </div>
    </>
  );
};
