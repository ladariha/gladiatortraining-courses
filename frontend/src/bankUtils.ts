import { formError } from "./messages";

type PaymentInfo = {
  bankCode: string;
  accountNumber: string;
  accountPrefix: string;
};

const addZeroPadding = (value: string, characters: number): string => {
  return value.padStart(characters, "0");
};

export const getIBAN = (e: PaymentInfo): string => {
  const prefix = addZeroPadding(e.accountPrefix, 6);
  const accountNumber = addZeroPadding(e.accountNumber, 10);
  const bankCode = addZeroPadding(e.bankCode, 4);

  const buf = `${bankCode + prefix + accountNumber}123500`;
  let index = 0;
  let dividend: string;
  let pz = -1;
  while (index <= buf.length) {
    if (pz < 0) {
      dividend = buf.substring(index, Math.min(index + 9, buf.length));
      index += 9;
    } else if (pz >= 0 && pz <= 9) {
      dividend = pz + buf.substring(index, Math.min(index + 8, buf.length));
      index += 8;
    } else {
      dividend = pz + buf.substring(index, Math.min(index + 7, buf.length));
      index += 7;
    }
    pz = parseInt(dividend, 10) % 97;
  }
  pz = 98 - pz;

  const checksum = addZeroPadding(`${pz}`, 2);

  const iban = `CZ${checksum}${bankCode}${prefix}${accountNumber}`;

  if (iban.length !== 24) {
    throw new Error(formError.accountNumber);
  }

  return iban;
};
