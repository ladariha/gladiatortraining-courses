import { common } from "./messages";
import { Registration } from "./types";

export const timestampToDate = (timestamp: number): string => {
  const d = new Date(timestamp);

  const minutes = d.getMinutes();

  return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()} ${d.getHours()}:${minutes >= 10 ? minutes : `0${minutes}`}`;
};

export const timestampToDateWithoutTime = (timestamp: number): string => {
  const d = new Date(timestamp);
  return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
};

export const isPastDate = (timestamp: number): boolean => {
  return new Date() >= new Date(timestamp);
};

export const getFirstLetters = (value: string): string => {
  return value
    .split(" ")
    .map((word) => word.charAt(0))
    .join("");
};

export const isValidString = (v?: string) => {
  return v && v.length > 0;
};

export const isValidEmail = (v?: string): boolean => {
  if (!isValidString(v)) {
    return false;
  }

  return /^\S.*@\S+$/.test(v as string);
};

export const isValidDate = (v?: number) => v !== undefined;

export const isValidStringNumber = (v?: string) => {
  if (!isValidString(v)) {
    return false;
  }
  return /^\d+$/.test(v as string);
};
export const isValidPhone = (v?: string) => {
  if (!isValidString(v)) {
    return false;
  }
  return /^[+]?\d+$/.test(v as string);
};

export const isValidNumber = (v: string | number | undefined, minimumValue: number) => {
  if (v === undefined) {
    return false;
  }
  if (typeof v === "number" && v >= minimumValue) {
    return true;
  }
  if (typeof v === "number" && v < minimumValue) {
    return false;
  }

  return /^[1-9]{,1}\d+$/.test(v as string) && parseInt(`${v}`, 10) >= minimumValue;
};

export const saveBlobAs = (fileBits: BlobPart[], filename: string): void => {
  const file = new File(fileBits, filename, {
    type: "application/octet-stream",
    lastModified: Date.now(),
  });
  const link = document.createElement("a");
  link.download = filename;
  link.href = window.URL.createObjectURL(file);
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const removeSemicolon = (value?: string | number) => {
  if (!value) {
    return " ";
  }
  return `${value}`.replace(/;/gm, "");
};
export const getDownloadRegistrationsContent = (registrations: Registration[]): string => {
  let content = `${[
    "#",
    common.firstName,
    common.lastName,
    common.regType,
    common.clubName,
    common.price,
    common.paymentStatus,
    common.address,
    common.phone,
    common.sex,
    common.address,
    common.email,
  ].join(";")}\n`;

  registrations.forEach((reg, index) => {
    const line = `${[
      index + 1,
      removeSemicolon(reg.name),
      removeSemicolon(reg.last_name),
      removeSemicolon(reg.registration_type_name),
      removeSemicolon(reg.club),
      removeSemicolon(reg.price),
      removeSemicolon(reg.is_leader ? (reg.paid ? common.yes : common.no) : "-"),
      reg.date_of_birth ? removeSemicolon(timestampToDateWithoutTime(reg.date_of_birth)) : " ",
      removeSemicolon(reg.phone),
      removeSemicolon(reg.sex),
      removeSemicolon(reg.address),
      removeSemicolon(reg.email),
    ].join(";")}\n`;
    content += line;
  });

  return content.trim();
};
