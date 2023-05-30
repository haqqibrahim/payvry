import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import {  useState } from 'react';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';

import BackButton from '../../components/BackButton';

import { showAlert } from '../../utils';
import {
  PaymentPayLoad,
  PaymentResponse,
} from '../../interfaces';

import banksResponse from '../../banks.json';

const Withdraw = () => {
  const navigate = useNavigate();
  const baseURL = process.env.REACT_APP_VENDOR_API!;
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [amount, setAmount] = useState(0);
  const [account_number, setAccountNumber] = useState('');
  const [account_bank, setAccountBank] = useState('');
  const [accountVerified, setAccountVerified] = useState(false);
  const [verifiedOwnerName, setVerifiedOwnerName] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const verifyAccount = async () => {
    setIsLoading(true);
    const generalInfoConfig: AxiosRequestConfig = {
      baseURL,
    };
    interface banks {
      account_bank: string;
      account_number: string;
    }

    const payLoad: banks = {
      account_bank: selectedBank,
      account_number: account_number,
    }

    axios
      .post('/bank', payLoad, generalInfoConfig)
      .then(res => {
        const response: PaymentResponse = res.data;
        setIsLoading(false)
        setVerifiedOwnerName(response.message)
        setAccountBank(selectedBank)
        setAccountNumber(account_number)
        setAccountVerified(true)
      })

      .catch((error: AxiosError) => {
        const errorCode = error.response!.status;
        const msg = (error.response!.data as { message: string }).message;
        console.log(error);
        if (errorCode === 500) {
          showAlert({ msg });
          setIsLoading(false)
        } else {
          showAlert({ msg });
          setIsLoading(false)
        }
      });
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
      account_name: verifiedOwnerName,
      account_number,
    };

    console.log(payload)


    axios
      .post('/withdraw', payload, generalInfoConfig)
      .then(res => {
        const response: PaymentResponse = res.data;
        showAlert({ msg: response.message });
        setIsLoading(false)
        navigate('/user');
        // setPaymentSuccessful(true);
      })

      .catch((error: AxiosError) => {
        const errorCode = error.response!.status;
        const msg = (error.response!.data as { message: string }).message;
        console.log(error);
        if (errorCode === 500) {
          showAlert({ msg });
          setIsLoading(false)
        } else {
          showAlert({ msg });
          setIsLoading(false)
        }
      });
  };

  const options = banksResponse.data.map((bank: any) => (
    <option key={bank.id} value={bank.code}>
      {bank.name}
    </option>
  ));

  return (
    <main className='h-screen flex flex-col' style={{ justifyContent: "center", alignItems: "center",width: "100vw" }}>
      <h1 className='font-semibold text-[20px]  leading-[26px] text-center pt-14'>Withdraw Funds</h1>
      <BackButton />

      <section className='p-[30px] flex flex-col' style={{width: "100vw"}}>
        <h2 className='font-medium text-[16px] text-center mt-20 mb-20 leading-[27px] text-[rgba(0,0,0,0.5)]'>
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
          className='mt-[30px]   bg-gallery rounded-[100px] py-[15px] px-5  placeholder:font-light text-[13px] leading-4 placeholder:text-mine-shaft tracking-[0.06em]'
        />

        <select
        style={{height: "50px", paddingLeft: "20px"}}
          className='mt-5  bg-gallery rounded-[100px] placeholder:font-light text-[13px] leading-4 placeholder:text-mine-shaft tracking-[0.06em]'

          value={selectedBank}
          onChange={(e) => setSelectedBank(e.target.value)}
        >
          <option value="" className="placeholder:font-light text-[13px] leading-4 placeholder:text-mine-shaft tracking-[0.06em]">Select a bank</option>
          {options}
        </select>



        {accountVerified && (
          <>
            <p className='mt-[30px] text-center font-medium text-[20px] leading-[26px]'>
              {verifiedOwnerName}
            </p>

            <div className='relative mt-[5px]'>

              <input
                type='text'
                placeholder='Amount to withdraw'
                onChange={e => setAmount(Number(e.target.value))}
          className='mt-[30px] w-full   bg-gallery rounded-[100px] py-[15px] px-5  placeholder:font-light text-[13px] leading-4 placeholder:text-mine-shaft tracking-[0.06em]'
              />
            </div>
          </>
        )}

        <button
          disabled={isLoading}
          onClick={accountVerified ? makePayment : verifyAccount}
          className='bg-mine-shaft text-center  rounded-[100px] py-[15px] whitespace-nowrap text-white mt-[30px] font-medium text-[15px] leading-[18px] tracking-[0.06em] '
        >
          {isLoading ? 'Loading...' : (accountVerified ? 'Proceed to withdraw' : 'Verify Account')}
        </button>
      </section>
      {/* )} */}
    </main>
  );
};

export default Withdraw;
