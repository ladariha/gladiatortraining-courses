import React from "react";
import { RegistrationEvent, RegistrationTemplate } from "../types";
import { Sidebar } from "primereact/sidebar";
import { common, formError } from "../messages";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { isValidDate, isValidEmail, isValidPhone, isValidString } from "../utils";
import { RegisterFormData, useSubmitRegistration } from "../hooks/useSubmitRegistration";
import { Calendar } from "primereact/calendar";
import { Asterisk } from "./Asterisk";
import { Checkbox } from "primereact/checkbox";
import { Dropdown } from "primereact/dropdown";

const formDatetoType = (
  registrationType: RegistrationTemplate,
  form: HTMLFormElement,
  dateOfBirths: Array<Date | undefined | null>,
  gdprs: boolean[],
  sex: string[]
): RegisterFormData => {
  const formData = new FormData(form);

  const result: RegisterFormData = {
    club: formData.get("club")?.toString() || "",
    registrations: [],
    registration_type_name: registrationType.name,
  };

  for (let index = 0; index < registrationType.number_of_people; index++) {
    const d = dateOfBirths[index];
    let dateOfBirth = -1;
    if (d) {
      dateOfBirth = d.getTime();
    }
    result.registrations[index] = {
      name: formData.get(`name_${index}`)?.toString() || "",
      last_name: formData.get(`last_name_${index}`)?.toString() || "",
      address: formData.get(`address_${index}`)?.toString() || "",
      email: formData.get(`email_${index}`)?.toString() || "",
      phone: formData.get(`phone_${index}`)?.toString() || "",
      date_of_birth: dateOfBirth,
      gdpr: gdprs[index] ? 1 : 0,
      sex: sex[index],
    };
  }

  return result;
};

const validateForm = (isClubRequired: boolean, form: RegisterFormData): Map<string, string> => {
  const errors = new Map<string, string>();

  if (!isValidString(form.club) && isClubRequired) {
    errors.set("club", formError.club);
  }

  form.registrations.forEach((reg, index) => {
    if (!isValidString(reg.name)) {
      errors.set(`name_${index}`, formError.firstName);
    }
    if (!isValidString(reg.last_name)) {
      errors.set(`last_name_${index}`, formError.lastName);
    }
    if (!isValidString(reg.address)) {
      errors.set(`address_${index}`, formError.address);
    }
    if (!isValidEmail(reg.email)) {
      errors.set(`email_${index}`, formError.email);
    }
    if (!isValidPhone(reg.phone)) {
      errors.set(`phone_${index}`, formError.phone);
    }
    if (!isValidDate(reg.date_of_birth)) {
      errors.set(`date_of_birth_${index}`, formError.dateOfBirth);
    }
    if (reg.gdpr === 0) {
      errors.set(`gdpr_${index}`, formError.gdpr);
    }
  });

  return errors;
};

type Props = {
  registrationType: RegistrationTemplate;
  event: RegistrationEvent;
  onHide: (success: boolean) => void;
};

export const RegisterSidebar: React.FC<Props> = ({ onHide, registrationType, event }) => {
  // eslint-disable-next-line no-null/no-null
  const formData = React.useRef<HTMLFormElement>(null);
  const [errors, setErrors] = React.useState<Map<string, string>>();
  const { submit, error, isSubmitting } = useSubmitRegistration();

  const getError = (fieldName: string) => {
    if (errors?.has(fieldName)) {
      return <small className="p-error mb-2">{errors?.get(fieldName)}</small>;
    }
    return <></>;
  };
  const [gdprChecked, setGdprChecked] = React.useState<boolean[]>([]);
  const [sex, setSex] = React.useState<string[]>(Array(registrationType.number_of_people).fill("muž"));
  const [birthDate, setBirthDate] = React.useState<Array<Date | undefined | null>>([]);

  const onSubmit = async () => {
    if (!formData.current) {
      return;
    }
    const data = formDatetoType(registrationType, formData.current, birthDate, gdprChecked, sex);
    const formErrors = validateForm(registrationType.number_of_people > 1, data);
    if (formErrors.size > 0) {
      setErrors(formErrors);
      return;
    }

    setErrors(undefined);

    const success = await submit({ payload: data, eventId: event.id });
    if (success) {
      onHide(true);
    }
  };

  return (
    <Sidebar
      position="right"
      className="w-full md:w-12 lg:w-4"
      onHide={() => onHide(false)}
      visible={true}
    >
      <>
        <h1>
          {common.registrationFor}&nbsp;{event.name} ({registrationType.name.toLocaleLowerCase()})
        </h1>

        <form ref={formData}>
          {registrationType.number_of_people > 1 && (
            <div className="formgrid grid">
              <div className="field col-12 md:col-12">
                <label htmlFor="club">
                  {common.clubName}
                  <Asterisk />
                </label>
                <InputText
                  className="w-full"
                  name="club"
                  id="club"
                />
                {getError("club")}
              </div>
            </div>
          )}
          {Array(registrationType.number_of_people)
            .fill(undefined)
            .map((_item, index) => {
              return (
                <React.Fragment key={index}>
                  {registrationType.number_of_people > 1 && (
                    <h2>
                      {common.member}&nbsp;{index + 1}
                    </h2>
                  )}
                  <div className="formgrid grid">
                    <div className="field col-12 md:col-6">
                      <label htmlFor={`name_${index}`}>
                        {common.firstName}
                        <Asterisk />
                      </label>
                      <InputText
                        className="w-full"
                        name={`name_${index}`}
                        id={`name_${index}`}
                      />
                      {getError(`name_${index}`)}
                    </div>
                    <div className="field col-12 md:col-6">
                      <label htmlFor={`last_name_${index}`}>
                        {common.lastName}
                        <Asterisk />
                      </label>
                      <InputText
                        className="w-full"
                        name={`last_name_${index}`}
                        id={`last_name_${index}`}
                      />
                      {getError(`last_name_${index}`)}
                    </div>
                    <div className="field col-12 md:col-6">
                      <label htmlFor={`email_${index}`}>
                        {common.email}
                        <Asterisk />
                      </label>
                      <InputText
                        className="w-full"
                        name={`email_${index}`}
                        id={`email_${index}`}
                      />
                      {getError(`email_${index}`)}
                    </div>
                    <div className="field col-12 md:col-6">
                      <label htmlFor={`phone_${index}`}>
                        {common.phone}
                        <Asterisk />
                      </label>
                      <InputText
                        className="w-full"
                        name={`phone_${index}`}
                        id={`phone_${index}`}
                      />
                      {getError(`phone_${index}`)}
                    </div>
                    <div className="field col-12 md:col-6">
                      <label htmlFor={`date_of_birth_${index}`}>
                        {common.birthDate}
                        <Asterisk />
                      </label>
                      <Calendar
                        value={birthDate[index]}
                        onChange={(e) => {
                          setBirthDate((oldValues) => {
                            const newValues = [...oldValues];
                            newValues[index] = e.value;
                            return newValues;
                          });
                        }}
                        className="w-full"
                        id={`date_of_birth_${index}`}
                        name={`date_of_birth_${index}`}
                        dateFormat="dd/mm/yy"
                        showTime={false}
                      />
                      {getError(`date_of_birth_${index}`)}
                    </div>
                    <div className="field col-12 md:col-6">
                      <label htmlFor={`address_${index}`}>
                        {common.address}
                        <Asterisk />
                      </label>
                      <InputText
                        className="w-full"
                        name={`address_${index}`}
                        id={`address_${index}`}
                      />
                      {getError(`address_${index}`)}
                    </div>
                    {registrationType.number_of_people === 1 && (
                      <div className="field col-12 md:col-6">
                        <label htmlFor="club">{common.clubName}</label>
                        <InputText
                          className="w-full"
                          name="club"
                          id="club"
                        />
                        {getError("club")}
                      </div>
                    )}
                    <div className="field col-12 md:col-6">
                      <label htmlFor={`address_${index}`}>
                        {common.sex}
                        <Asterisk />
                      </label>
                      <Dropdown
                        value={sex[index]}
                        onChange={(e) => {
                          setSex((oldValues) => {
                            const newValues = [...oldValues];
                            newValues[index] = e.value;
                            return newValues;
                          });
                        }}
                        options={[
                          { label: common.sexMale, value: "muž" },
                          { label: common.sexFemale, value: "žena" },
                        ]}
                        optionLabel="label"
                        className="w-full"
                      />
                    </div>

                    <div className={`field col-12 ${registrationType.number_of_people === 1 ? "md:col-6" : ""} align-items-center`}>
                      <div className="flex flex-column align-items-center">
                        <label
                          htmlFor={`gdpr_${index}`}
                          className="mb-2"
                        >
                          Souhlasím se zpracováním osobních údajů dle pravidel GDPR
                          <Asterisk />
                        </label>
                        <Checkbox
                          name={`gdpr_${index}`}
                          id={`gdpr_${index}`}
                          onChange={(e) => {
                            setGdprChecked((oldValues) => {
                              const newValues = [...oldValues];
                              newValues[index] = !!e.checked;
                              return newValues;
                            });
                          }}
                          checked={gdprChecked[index]}
                        />
                        {getError(`gdpr_${index}`)}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          <div>{error && <small className="p-error mb-2">{error}</small>}</div>
          <div className="formgrid grid">
            <div className={`field col-12 ${registrationType.number_of_people > 1 ? "text-right" : "text-left"}`}>
              <Button
                loading={isSubmitting}
                onClick={onSubmit}
                type="button"
                disabled={isSubmitting}
                label={common.register}
              />
            </div>
          </div>
        </form>
      </>
    </Sidebar>
  );
};
