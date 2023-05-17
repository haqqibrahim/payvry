import { PaymentResponseMessage, PaymentType, TransactionStatus, TransactionType } from './types';

interface HistoryData {
  _id: string;
  __v?: number;
  amount: number;
  user_id: string;
  date: string;
  transactionType: TransactionType;
  transaction_ref: string;
  status: TransactionStatus;
}

interface BaseUser {
  _id: string;
  __v?: number;
  setPin: boolean;
  password: string;
  createdAt?: string;
  updatedAt?: string;
  phoneNumber: string;
}

export interface UserHistoryData extends HistoryData {
  vendor: string;
}

export interface VendorHistoryData extends HistoryData {
  user: string;
  refund_ref?: string;
}

export interface ExtraStyle {
  [key: string]: string | number;
}

export interface User extends BaseUser {
  fullName: string;
  matricNumber: string;
}

export interface Vendor extends BaseUser {
  vendorName: string;
  vendorOwner: string;
  vendorUsername: string;
}

export interface Transaction {
  to: string;
  from: string;
  date: string;
  userName: string;
  paymentType: PaymentType;
}

export interface AlertProps {
  msg: string;
  zIndex?: string;
  bgColor?: string;
  duration?: number;
  textColor?: string;
}

export interface InfoProps {
  xPos?: number;
  yPos?: number;
  classTarget?: string;
}

export interface UserResponse {
  user: User;
  message: string;
  userTransaction: UserHistoryData[];
}

export interface VendorResponse {
  vendor: Vendor;
  message: string;
  vendorTransaction: VendorHistoryData[];
}

export interface UserLoginPayload {
  password: string;
  matricNumber: string;
}

export interface VendorLoginPayload {
  password: string;
  vendorUsername: string;
}

export interface UserSignupPayload {
  fullName: string;
  password: string;
  phoneNumber: string;
  matricNumber: string;
}

export interface VendorSignupPayload {
  password: string;
  vendorName: string;
  phoneNumber: string;
  vendorOwner: string;
  vendorUsername: string;
}

export interface CreatePinPayload {
  pin: string;
  token: string;
}

export interface UserProfileUpdatePayload {
  fullName?: string;
  password?: string;
  phoneNumber?: string;
  matricNumber?: string;
}

export interface VendorProfileUpdatePayload {
  password?: string;
  vendorName?: string;
  phoneNumber?: string;
  vendorOwner?: string;
  vendorUsername?: string;
}

export interface PaymentPayload {
  pin: string;
  token: string;
  amount: string;
  matricNumber: string;
}

export interface VerifyAccountPayload {
  token: string;
  matricNumber: string;
}

export interface PaymentResponse {
  message: PaymentResponseMessage;
  vendorTransaction: VendorHistoryData;
}

export interface RefundPayload {
  token: string;
  amount: string;
  matricNumber: string;
  transaction_ref: string;
}

export interface RefundResponse {
  message: string;
  refundTransaction: VendorHistoryData;
}

export interface UserTokenResponse {
  token: string;
  user: User;
}

export interface VendorTokenResponse {
  token: string;
  vendor: Vendor;
}

export interface FormatInputText {
  text: string;
  regex?: RegExp;
  allowedChars?: string;
  disallowedChars?: string;
}

export interface OtpHashMap {
  [key: string]: string;
}
