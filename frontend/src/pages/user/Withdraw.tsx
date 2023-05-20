import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { useRef, useState, useMemo } from 'react';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';

import eyeImage from '../../assets/svgs/eye.svg';
import payFailImage from '../../assets/svgs/pay-fail.svg';
import eyeSlashImage from '../../assets/svgs/eye-slash.svg';
import paySuccessImage from '../../assets/svgs/pay-success.svg';

import BackButton from '../../components/BackButton';

import { showAlert, togglePassword } from '../../utils';
import {
  Bank,
  PaymentPayLoad,
  PaymentPayload,
  PaymentResponse,
  VerifyAccountPayload,
} from '../../interfaces';

import banksResponse from '../../banks.json';

const Withdraw = () => {
  const navigate = useNavigate();
  const pinRef = useRef<HTMLInputElement>(null);
  const baseURL = process.env.REACT_APP_USER_API!;

  const [amount, setAmount] = useState(0);
  const [pinHidden, setPinHidden] = useState(true);
  const [account_number, setAccountNumber] = useState('');
  const [searchBank, setBank] = useState('');
  const [account_bank, setAccountBank] = useState('');
  const [paymentMade, setPaymentMade] = useState(false);
  const [accountVerified, setAccountVerified] = useState(false);
  const [verifiedOwnerName, setVerifiedOwnerName] = useState('');
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const newDate = useMemo(() => new Date(), [paymentSuccessful]);
  const paymentID = useMemo(() => 'D32SASFGD243DF', [paymentSuccessful]);

  const [account_name, setAccountName] = useState('');

  const verifyAccount = async () => {
    setIsLoading(true);
    const generalInfoConfig: AxiosRequestConfig = {
      baseURL,
    };

    const token: string | undefined = Cookies.get('token-payvry');

    if (!token) {
      showAlert({ msg: 'An error occured while accessing your details' });
      navigate('/vendor');
      return;
    }
    const bank: Bank | undefined = banksResponse.data.find(({ name }) => {
      return name.toLowerCase() === searchBank.toLowerCase();
    });

    if (bank) {
      console.log(`Found bank with id ${bank.id} and code ${bank.code}`);
      setAccountBank(bank.code);
      makePayment();
      setIsLoading(false);
    } else {
      showAlert({ msg: 'Bank not found' });
      console.log('Bank not found');
      setIsLoading(false);
    }
  };

  const makePayment = () => {
    setIsLoading(true);
    const generalInfoConfig: AxiosRequestConfig = {
      baseURL,
    };

    const token: string | undefined = Cookies.get('token-payvry');

    if (!token) {
      showAlert({ msg: 'An error occured while accessing your details' });
      navigate('/vendor');
      return;
    }

    const payload: PaymentPayLoad = {
      token,
      amount,
      account_bank,
      account_name,
      account_number,
    };

    console.log(payload);

    axios
      .post('/withdraw', payload, generalInfoConfig)
      .then(res => {
        const response: PaymentResponse = res.data;
        showAlert({ msg: response.message });
        navigate('/user');
        // setPaymentSuccessful(true);
      })

      .catch((error: AxiosError) => {
        const errorCode = error.response!.status;
        const msg = (error.response!.data as { message: string }).message;
        console.log(error);
        if (errorCode === 500) {
          showAlert({ msg });
          // setPaymentSuccessful(false);
        } else {
          showAlert({ msg });
          // setPaymentSuccessful(false);
        }
        // setIsLoading(false);
      });
    // setPaymentMade(true);
  };

  return (
    <main className='min-h-screen px-5 mb-[100px] flex flex-col items-center justify-center'>
      <h1 className='font-semibold text-[20px] leading-[26px] text-center pt-14'>Withdraw Funds</h1>
      <BackButton />
      {/* 
      {paymentMade ? (
        <section className='mt-[180px] bg-alto rounded-[30px] p-[10px]'>
          <div className='grid grid-cols-3 gap-y-[15px] bg-white rounded-[20px] py-5 px-[30px] font-medium'>
            <p className='col-start-1 col-end-3 text-[10px] leading-[17px]'>
              {newDate.toDateString()} {newDate.toLocaleTimeString()}
            </p>
            <p className='text-[10px] leading-[17px] text-right'>{paymentID}</p>

            <img
              alt=''
              className='w-[30px] h-[30px] col-start-1 col-end-4 mx-auto'
              src={paymentSuccessful ? paySuccessImage : payFailImage}
            />
            <p
              className={`col-start-1 col-end-4 text-center font-semibold text-[24px] leading-10 ${paymentSuccessful ? 'text-mountain-meadow' : 'text-carnation'
                }`}
            >
              C{amount.toLocaleString()}
            </p>

            <p className='col-start-1 col-end-3 text-[14px] leading-6'>{account_number}</p>
            <p
              className={`text-right text-[14px] leading-6 ${paymentSuccessful ? 'text-mountain-meadow' : 'text-carnation'
                }`}
            >
              {paymentSuccessful ? 'Payment Successful' : 'Payment Unsuccessful'}
            </p>
          </div>
        </section>
      ) : ( 
        // */}
      <section className='mt-[180px] border-[1px] border-alto rounded-[30px] p-[30px] max-w-[400px]'>
        <h2 className='font-medium text-[16px] leading-[27px] text-[rgba(0,0,0,0.5)]'>
          We get your payments to you, any time you like
        </h2>

        <input
          type='text'
          placeholder='Account Number'
          onChange={e => {
            setAccountNumber(e.target.value);
            setAccountVerified(false);
            setVerifiedOwnerName('');
          }}
          className='mt-[30px] bg-gallery rounded-[100px] py-[15px] px-5 w-full placeholder:font-light text-[13px] leading-4 placeholder:text-mine-shaft tracking-[0.06em]'
        />

        <input
          type='text'
          placeholder='Bank Name in Full'
          onChange={e => setBank(e.target.value)}
          className='mt-5 bg-gallery rounded-[100px] py-[15px] px-5 w-full placeholder:font-light text-[13px] leading-4 placeholder:text-mine-shaft tracking-[0.06em]'
        />

        <input
          type='text'
          placeholder='Name on Account'
          onChange={e => setAccountName(e.target.value)}
          className='mt-5 bg-gallery rounded-[100px] py-[15px] px-5 w-full placeholder:font-light text-[13px] leading-4 placeholder:text-mine-shaft tracking-[0.06em]'
        />
        <input
          type='text'
          placeholder='Amount to withdraww'
          onChange={e => setAmount(Number(e.target.value))}
          className='mt-5 bg-gallery rounded-[100px] py-[15px] px-5 w-full placeholder:font-light text-[13px] leading-4 placeholder:text-mine-shaft tracking-[0.06em]'
        />
        {accountVerified && (
          <>
            <p className='mt-[30px] text-center font-medium text-[20px] leading-[26px]'>
              {verifiedOwnerName}
            </p>

            <div className='relative mt-[30px]'>
              <input
                ref={pinRef}
                type='password'
                placeholder='Pin'
                className='bg-gallery rounded-[100px] py-[15px] px-5 w-full placeholder:font-light text-[13px] leading-4 placeholder:text-mine-shaft tracking-[0.06em]'
              />
              <img
                alt=''
                onClick={() => {
                  togglePassword(pinRef);
                  setPinHidden(!pinHidden);
                }}
                src={pinHidden ? eyeImage : eyeSlashImage}
                className='w-5 h-5 absolute top-[30%] right-5 cursor-pointer'
              />
            </div>
          </>
        )}

        <button
          disabled={isLoading}
          onClick={verifyAccount}
          className='bg-mine-shaft rounded-[100px] py-[15px] px-[88px] whitespace-nowrap text-white mt-[30px] font-medium text-[15px] leading-[18px] tracking-[0.06em] w-full'
        >
          {isLoading ? 'Loading...' : 'Proceed to withdraw'}
        </button>
      </section>
      {/* )} */}
    </main>
  );
};

export default Withdraw;
