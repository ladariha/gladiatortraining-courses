export enum UserRole {
  Admin = "admin",
  Visitor = "visitor",
}

export type RegistrationEvent = {
  id: number;
  name: string;
  short_description: string;
  description: string;
  max_people: number;
  time: number;
  registration_end: number;
  people: number;
  image?: string;
  visible: number;
  registrations: string;
  bank_code: string;
  account_number: string;
  prefix?: string;
  swift: string;
  iban: string;
};

export type RegistrationTemplate = {
  id: number;
  name: string;
  number_of_people: number;
  price: number;
};

type OutputData = unknown;

export interface EditorCore {
  destroy(): Promise<void>;
  clear(): Promise<void>;
  save(): Promise<OutputData>;
  render(data: OutputData): Promise<void>;
  get dangerouslyLowLevelInstance(): unknown | null;
}

export type Registration = {
  id: number;
  group_id: number;
  gdpr: number;
  is_leader: number;
  paid: number;
  price: number;
  date_of_birth?: number;
  name: string;
  registration_type_name: string;
  email?: string;
  address?: string;
  club: string;
  phone?: string;
  sex?: string;
  last_name: string;
};
