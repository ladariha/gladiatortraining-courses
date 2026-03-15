import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import React from "react";
import { useSubmitEvent, EventFormData } from "../hooks/useSubmitEvent";
import { EditorCore, RegistrationTemplate } from "../types";
import { isValidDate, isValidNumber, isValidString, isValidStringNumber } from "../utils";
import { common, formError, event, admin } from "../messages";
import { InputNumber } from "primereact/inputnumber";
import { createReactEditorJS } from "react-editor-js";
import { EDITOR_JS_TOOLS } from "../editorTools";
import { useNavigate } from "react-router-dom";
import { DataTable, DataTableRowEditCompleteEvent } from "primereact/datatable";
import { Column, ColumnEditorOptions } from "primereact/column";
import { Asterisk } from "./Asterisk";
import { Message } from "primereact/message";

const formDatetoType = (
  existingEvent: Partial<EventFormData> | undefined,
  form: HTMLFormElement,
  eventTime: Date | undefined | null,
  maxPeople: number | undefined | null,
  endRegistrationTime: Date | undefined | null,
  selectedTemplates: RegistrationTemplate[]
): EventFormData => {
  const formData = new FormData(form);

  const result: EventFormData = {
    id: existingEvent?.id || -1,
    name: formData.get("name")?.toString() || "",
    short_description: " ",
    description: "",
    iban: "",
    swift: formData.get("swift")?.toString() || "",
    max_people: maxPeople || -2,
    image: formData.get("image")?.toString() || "",
    time: eventTime ? eventTime.getTime() : -1,
    registration_end: endRegistrationTime ? endRegistrationTime.getTime() : -1,
    people: 0,
    bank_code: formData.get("bank_code")?.toString() || "",
    account_number: formData.get("account_number")?.toString() || "",
    prefix: formData.get("prefix")?.toString() || "",
    visible: 1,
    registrations: selectedTemplates,
  };

  return result;
};

const validateForm = (form: EventFormData): Map<string, string> => {
  const errors = new Map<string, string>();

  if (!isValidString(form.name)) {
    errors.set("name", formError.name);
  }

  if (!isValidString(form.swift)) {
    errors.set("swift", formError.swift);
  }
  if (!isValidString(form.image)) {
    errors.set("image", formError.image);
  }
  if (!isValidDate(form.time)) {
    errors.set("time", formError.time);
  }

  if (!isValidDate(form.registration_end) || form.registration_end > form.time) {
    errors.set("registration_end", formError.endTime);
  }

  if (!isValidStringNumber(form.account_number)) {
    errors.set("account_number", formError.accountNumber);
  }

  if (!isValidStringNumber(form.bank_code)) {
    errors.set("bank_code", formError.bankCode);
  }

  if (isValidString(form.prefix) && !isValidStringNumber(form.prefix)) {
    errors.set("prefix", formError.prefix);
  }

  if (!isValidNumber(form.max_people, -1)) {
    errors.set("max_people", formError.maxPeople);
  }

  if (form.registrations.length === 0) {
    errors.set("registrations", formError.regTemplates);
  }

  return errors;
};
export const EventForm: React.FC<{ defaultData?: Partial<EventFormData> }> = ({ defaultData }) => {
  const isCreate = defaultData?.id === undefined;
  const { submit, error, isSubmitting, eventId } = useSubmitEvent(isCreate);
  const [registrationTemplates, setRegistrationTemplates] = React.useState<RegistrationTemplate[]>(
    defaultData?.registrations || [
      {
        id: 1,
        name: common.singlePerson,
        number_of_people: 1,
        price: 100,
      },
    ]
  );

  const getDefaultValue = (propertyName: keyof EventFormData, fallbackValue: unknown) => {
    if (!defaultData) {
      return fallbackValue;
    }

    return defaultData[propertyName];
  };
  const ReactEditorJS = createReactEditorJS();
  const navigate = useNavigate();

  // eslint-disable-next-line no-null/no-null
  const formData = React.useRef<HTMLFormElement>(null);
  const [errors, setErrors] = React.useState<Map<string, string>>();

  // eslint-disable-next-line no-null/no-null
  const [eventTime, setEventTime] = React.useState<Date | undefined | null>(new Date(defaultData?.time || new Date()));

  // eslint-disable-next-line no-null/no-null
  const [maxPeople, setMaxPeople] = React.useState<number | null>(getDefaultValue("max_people", 100) as number);

  const [endRegistrationTime, setEndRegistrationTime] = React.useState<Date | undefined | null>(
    defaultData?.registration_end ? new Date(defaultData?.registration_end) : new Date()
  );
  // eslint-disable-next-line no-null/no-null
  const editorCore = React.useRef<EditorCore | null>(null);
  const handleInitialize = React.useCallback((instance: EditorCore) => {
    editorCore.current = instance;
  }, []);

  const onSubmit = async () => {
    if (!formData.current) {
      return;
    }
    const data = formDatetoType(defaultData, formData.current, eventTime, maxPeople, endRegistrationTime, registrationTemplates);
    const formErrors = validateForm(data);
    if (formErrors.size > 0) {
      setErrors(formErrors);
      return;
    }

    setErrors(undefined);

    const editorBlocks: string = JSON.stringify(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line no-unsafe-optional-chaining
      (await editorCore.current?.save()).blocks
    );

    await submit({ payload: data, editorBlocks });
  };

  React.useEffect(() => {
    if (eventId !== undefined) {
      navigate(`/events/${eventId}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const getError = (fieldName: string) => {
    if (errors?.has(fieldName)) {
      return <small className="p-error mb-2">{errors?.get(fieldName)}</small>;
    }
    return <></>;
  };

  const textEditor = (options: ColumnEditorOptions) => {
    return (
      <InputText
        type="text"
        value={options.value}
        onChange={(e) => options.editorCallback?.(e.target.value)}
      />
    );
  };

  const deleteRegistrationTemplate = (id: number) => {
    setRegistrationTemplates((oldValues) => {
      return oldValues.filter((i) => i.id !== id);
    });
  };

  const addRegistration = () => {
    setRegistrationTemplates((oldValues) => {
      const largestId = oldValues.map((x) => x.id).sort((a, b) => b - a)[0] || 0;
      return [
        ...oldValues,
        {
          name: common.singlePerson,
          price: 0,
          number_of_people: 0,
          id: largestId + 1,
        },
      ];
    });
  };

  const numberEditor = (options: ColumnEditorOptions) => {
    return (
      <InputNumber
        value={options.value}
        locale="cs"
        onValueChange={(e) => options.editorCallback?.(e.value)}
      />
    );
  };

  const onRowEditComplete = (e: DataTableRowEditCompleteEvent) => {
    const newTemplates = [...registrationTemplates];
    const { newData, index } = e;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    newTemplates[index] = newData;

    setRegistrationTemplates(newTemplates);
  };

  return (
    <div>
      <style>{`.et_pb_section.et_pb_section_1.et_section_regular {
            background: white;
            background-image: none !important;
      }
      `}</style>
      <div className="flex align-items-center">
        <a
          className="back-link mr-2"
          href={isCreate ? "#/" : `#/events/${defaultData.id}`}
        >
          <i className="pi pi-arrow-left" />
          &nbsp;
          {common.back}
        </a>
        <h1>{isCreate ? common.new : common.editEvent}</h1>
      </div>
      <form ref={formData}>
        <div className="formgrid grid">
          <div className="field col-12 md:col-6">
            <label htmlFor="name">
              {common.name}
              <Asterisk />
            </label>
            <InputText
              defaultValue={getDefaultValue("name", "") as string}
              className="w-full"
              name="name"
              id="name"
            />
            {getError("name")}
          </div>
          <div className="field col-12 md:col-2">
            <label htmlFor="time">
              {common.date}
              <Asterisk />
            </label>
            <Calendar
              value={eventTime}
              onChange={(e) => {
                setEventTime(e.value);
              }}
              className="w-full"
              dateFormat="dd/mm/yy"
              id="time"
              name="time"
              showTime={true}
              hourFormat="24"
            />
            {getError("time")}
          </div>
          <div className="field col-12 md:col-2">
            <label htmlFor="registration_end">
              {event.closedRegistration}
              <Asterisk />
            </label>
            <Calendar
              value={endRegistrationTime}
              dateFormat="dd/mm/yy"
              onChange={(e) => setEndRegistrationTime(e.value)}
              className="w-full"
              id="registration_end"
              name="registration_end"
              showTime={true}
              hourFormat="24"
            />
            {getError("registration_end")}
          </div>
          <div className="field col-12 md:col-2">
            <label htmlFor="max_people">
              {common.maxPeople}
              <Asterisk />
            </label>
            <InputNumber
              value={maxPeople}
              locale="cs"
              onChange={(e) => {
                return setMaxPeople(e.value);
              }}
              className="w-full"
              name="max_people"
              id="max_people"
            />
            {getError("max_people")}
          </div>
          <div className="field col-12 md:col-6">
            <label htmlFor="image">
              {common.image}
              <Asterisk />
            </label>
            <InputText
              defaultValue={getDefaultValue("image", "") as string}
              className="w-full"
              name="image"
              id="image"
            />
            {getError("image")}
          </div>
          <div className="col-12">
            <h2>{common.payment}</h2>
            <div className="grid">
              <div className="field col-12 md:col-2">
                <label htmlFor="prefix">{common.prefix}</label>
                <InputText
                  className="w-full"
                  name="prefix"
                  id="prefix"
                  defaultValue={getDefaultValue("prefix", "") as string}
                />
                {getError("prefix")}
              </div>
              <div className="field col-12 md:col-5">
                <label htmlFor="account_number">
                  {common.accountNumber}
                  <Asterisk />
                </label>
                <InputText
                  defaultValue={getDefaultValue("account_number", "") as string}
                  className="w-full"
                  name="account_number"
                  id="account_number"
                />
                {getError("account_number")}
              </div>

              <div className="field col-12 md:col-2">
                <label htmlFor="bank_code">
                  {common.bankCode}
                  <Asterisk />
                </label>
                <InputText
                  className="w-full"
                  name="bank_code"
                  id="bank_code"
                  defaultValue={getDefaultValue("bank_code", "") as string}
                />
                {getError("bank_code")}
              </div>

              <div className="field col-12 md:col-2">
                <label htmlFor="swift">
                  {common.swift}
                  <Asterisk />
                </label>
                <InputText
                  className="w-full"
                  name="swift"
                  id="swift"
                  defaultValue={getDefaultValue("swift", "") as string}
                />
                {getError("swift")}
              </div>
            </div>
          </div>
          <div className="col-12">
            <div className="flex justify-content-start align-items-center ">
              <h2>{admin.regs}</h2>
              <div>
                <Button
                  size="small"
                  type="button"
                  icon="pi pi-plus"
                  onClick={addRegistration}
                  className="m-1"
                />
              </div>
            </div>
            <Message
              severity="warn"
              text={admin.warning}
            />

            <div className="card flex justify-content-start">
              <div className="flex flex-column gap-3">
                <DataTable
                  stripedRows={true}
                  size="small"
                  value={registrationTemplates}
                  editMode="row"
                  dataKey="id"
                  onRowEditComplete={onRowEditComplete}
                  tableStyle={{ minWidth: "50rem" }}
                >
                  <Column
                    field="name"
                    header={common.name}
                    editor={(options) => textEditor(options)}
                    style={{ width: "20%" }}
                  />
                  <Column
                    field="number_of_people"
                    header={common.maxPeople}
                    editor={(options) => numberEditor(options)}
                    style={{ width: "20%" }}
                  />
                  <Column
                    field="price"
                    header={common.price}
                    editor={(options) => numberEditor(options)}
                    style={{ width: "20%" }}
                  />
                  <Column
                    rowEditor={true}
                    headerStyle={{ width: "10%", minWidth: "4rem" }}
                    bodyStyle={{ textAlign: "center" }}
                  />
                  <Column
                    headerStyle={{ width: "10%", minWidth: "4rem" }}
                    bodyStyle={{ textAlign: "center" }}
                    body={(item) => (
                      <Button
                        icon="pi pi-trash"
                        size="small"
                        type="button"
                        severity="danger"
                        disabled={registrationTemplates.length === 1}
                        onClick={() => deleteRegistrationTemplate(item.id)}
                      />
                    )}
                  />
                </DataTable>
                {getError("registrations")}
              </div>
            </div>
          </div>
          <div className="col-12">
            <h2>{common.desc}</h2>

            <div className="grid">
              <div className="field col-12">
                <label htmlFor="description">
                  {common.descFull}
                  <Asterisk />
                </label>
                <div
                  className="border-1 m-3 border-round surface-border"
                  style={{ maxWidth: "850px" }}
                >
                  <ReactEditorJS
                    defaultValue={{
                      blocks: defaultData?.description ? JSON.parse(defaultData?.description) : [],
                    }}
                    onInitialize={handleInitialize}
                    tools={EDITOR_JS_TOOLS}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>{error && <small className="p-error mb-2">{error}</small>}</div>
        <div className="text-right">
          <Button
            loading={isSubmitting}
            onClick={onSubmit}
            type="button"
            disabled={isSubmitting}
            label={isCreate ? common.create : common.edit}
          />

          <Button
            onClick={() => {
              window.history.back();
            }}
            type="button"
            className="ml-2"
            severity="danger"
            label={common.cancel}
          />
        </div>
      </form>
    </div>
  );
};
