import { Student } from './student.model';

export interface Payment {
  id: number;
  date: string;
  amount: number;
  type: string;
  status: string;
  file: string;
  student: Student;
}

export enum PaymentType {
  CASH,
  CHECK,
  TRANSFER,
  DEPOSIT,
}

export enum PaymentStatus {
  CREATED,
  VALIDATED,
  REJECTED,
}
