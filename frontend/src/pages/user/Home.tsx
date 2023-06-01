import Cookies from 'js-cookie';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';

import eyeImage from '../../assets/svgs/eye.svg';
import userImage from '../../assets/svgs/user.svg';
// import chatImage from '../../assets/svgs/chat.svg';
import eyeSlashImage from '../../assets/svgs/eye-slash.svg';

import { showAlert, showInfo, togglePassword } from '../../utils';
import { UserHistoryData, UserResponse } from '../../interfaces';

import HistoryPanel from '../../components/user/HistoryPanel';
import { FiLogOut } from 'react-icons/fi';


const Home = () => {
  const navigate = useNavigate();

  const balanceRef = useRef<HTMLInputElement>(null);
  const [balanceHidden, setBalanceHidden] = useState(true);
  const [amount, setAmount] = useState('');
  const [fullName, setFullName] = useState('');
  const [history, setHistory] = useState<UserHistoryData[]>([]);
  const [phoneNumber, setPhoneNumber] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [aza, setAza] = useState('')
  const [bank, setBank] = useState('')
  const [tfAmount, settfAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [dtls, setDtls] = useState(false)
  // componentDidMount
  useEffect(() => {
    const generalInfoConfig: AxiosRequestConfig = {
      baseURL: process.env.REACT_APP_USER_API!,
    };
    const token: string | undefined = Cookies.get('token-payvry');

    if (!token) {
      showAlert({ msg: 'Hmm, seems like you are not logged in!' });
      navigate('/user/login');
      return;
    }

    const payload = { token };

    axios
      .post('/user', payload, generalInfoConfig)
      .then(res => {
        const response: UserResponse = res.data;
        const { user, userTransaction } = response;
        const { fullName, phoneNumber } = user;

        setFullName(fullName);
        setPhoneNumber(phoneNumber)
        setHistory(userTransaction);
      })
      .catch((error: AxiosError) => {
        const errorCode = error.response!.status;
        const msg = (error.response!.data as { message: string }).message;

        if (errorCode === 500) {
          showAlert({ msg: msg });
        } else {
          showAlert({ msg: error.message });
        }
      });
    axios
      .post('/balance', payload, generalInfoConfig)
      .then(res => {
        const response: { message: number } = res.data;
        const balance: number = response.message;
        balanceRef.current!.value = `N${balance.toLocaleString()}`;
      })
      .catch((error: AxiosError) => showAlert({ msg: error.message }));
  }, []);

  const QRCode = () => {
    const generalInfoConfig: AxiosRequestConfig = {
      baseURL: process.env.REACT_APP_USER_API!,
    };
    const token: string | undefined = Cookies.get('token-payvry');

    interface QrCodePayload {
      token?: String
    }

    const payload: QrCodePayload = {
      token
    };

    axios
      .post('/qrcode', payload, generalInfoConfig)
      .then(res => {
        const response: any = res.data;

      })
      .catch((error: AxiosError) => {
        const errorCode = error.response!.status;
        const msg = (error.response!.data as { message: string }).message;

        if (errorCode === 500) {
          showAlert({ msg: msg });
        } else {
          showAlert({ msg: error.message });
        }
      });
  }

  const getlwAcct = () => {
    setIsLoading(true)
    const generalInfoConfig: AxiosRequestConfig = {
      baseURL: process.env.REACT_APP_USER_API!,
    };
    const token: string | undefined = Cookies.get('token-payvry');

    interface accountPayload {
      token?: String,
      amount?: Number
    }

    const payload: accountPayload = {
      token,
      amount: Number(amount)
    };

    axios
      .post('/deposit', payload, generalInfoConfig)
      .then(res => {
        const response: any = res.data;
        const { message, transfer_details } = response;
        const { transfer_account, transfer_bank, transfer_amount } = transfer_details;
        setBank(transfer_bank)
        console.log(`bank ${bank}`)
        console.log(`transfer_bank ${transfer_bank}`)
        showAlert({ msg: message })
        setAza(transfer_account)
        settfAmount(transfer_amount)
        setIsLoading(false)
        setDtls(true)
      })
      .catch((error: AxiosError) => {
        const errorCode = error.response!.status;
        const msg = (error.response!.data as { message: string }).message;

        if (errorCode === 500) {
          showAlert({ msg: msg });
        } else {
          showAlert({ msg: error.message });
        }
        setIsLoading(false)
      });
  }

  return (
    <main className='px-5 pt-[59px] tracking-[0.04em] pb-[57px]'>
      <header className='flex items-center justify-between text-center'>
        <Link
          to='/user/profile'
          className='w-[50px] h-[50px] rounded-full grid place-items-center border-[1px] border-alto'
        >
          <img src={userImage} alt='' />
        </Link>

        <h1 className='font-semibold text-[18px]  px-5 leading-[30px]'>Hello {fullName}</h1>

        <div
          onClick={() => {
            Cookies.set('token-payvry', "");
            navigate('/user/login');
          }}
          className='w-[50px] h-[50px] cursor-pointer rounded-full grid place-items-center border-[1px] border-alto'
        >
          <FiLogOut style={{ color: "red" }} />
        </div>
      </header>

      {dtls ? (
        <form
          style={{ width: "90%" }}

          onSubmit={(e) => {
            e.preventDefault()
            setDtls(false)
            setAmount('')
            setAza('')
            settfAmount('')
            setBank('')
          }}
          className='info-bubble pay-modal text-center hidden bg-alto w-[90%] fixed z-[1] p-[30px] rounded-[30px] border-[1px] border-alto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
        >
          <h4 className='font-semibold text-[18px]'>Payvry Deposit</h4>

          <label htmlFor='account' className='text-left mt-5 block'>
            <span className='block mx-3'>Account Number</span>
            <input
              disabled
              style={{ marginLeft: "auto", marginRight: "auto", width: "100%" }}

              type='number'
              id='account'
              name='account'
              value={aza}
              className='placeholder:text-mine-shaft bg-grey-200 w-[90%] rounded-[100px] py-[10px] px-5 mt-1'
            />
          </label>
          <label htmlFor='bank' className='text-left mt-5 block'>
            <span className='block mx-3'>Account Bank</span>
            <input
              style={{ marginLeft: "auto", marginRight: "auto", width: "100%" }}

              disabled
              type='text'
              id='bank'
              name='bank'
              value={bank}
              className='placeholder:text-mine-shaft bg-grey-200 w-[90%] rounded-[100px] py-[10px] px-5 mt-1'
            />
          </label>
          <label htmlFor='amount' className='text-left mt-5 block'>
            <span className='block mx-3'>Amount</span>
            <input
              style={{ marginLeft: "auto", marginRight: "auto", width: "100%" }}

              disabled
              type='number'
              id='amount'
              name='amount'
              value={tfAmount}
              className='placeholder:text-mine-shaft bg-grey-200 w-[90%] rounded-[100px] py-[10px] px-5 mt-1'
            />
          </label>

          <input
            type='submit'
            value='Done'
            style={{ marginLeft: "auto", marginRight: "auto" }}
            className='bg-mine-shaft mx-auto text-center text-white w-full py-[15px] rounded-[100px] mt-[22px] font-medium text-[15px] leading-[18px] tracking-[0.06em] cursor-pointer'
          />
        </form>
      ) : (
        <form
          style={{ width: "90%" }}
          onSubmit={(e) => {
            e.preventDefault()
            getlwAcct()
          }}
          className='info-bubble pay-modal text-center hidden bg-white w-[90%] fixed z-[1] p-[30px] rounded-[30px] border-[1px] border-alto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
        >
          <h4 className='font-semibold text-[18px]'>Payvry Deposit</h4>

          <label htmlFor='amounts' className='text-left mt-5 block'>
            <span className='block mx-3'>Amount to deposit</span>
            <input
              style={{ marginLeft: "auto", marginRight: "auto", width: "100%" }}
              required
              type='number'
              id='amounts'
              name='amounts'
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className='placeholder:text-mine-shaft mx-auto bg-grey-200 rounded-[100px] py-[10px] px-5 mt-1'
            />
          </label>

          <input
            disabled={isLoading}
            type='submit'
            value={isLoading ? 'Loading...' : 'Proceed'}
            style={{ marginLeft: "auto", marginRight: "auto" }}
            className='bg-mine-shaft mx-auto text-center text-white w-full py-[15px] rounded-[100px] mt-[22px] font-medium text-[15px] leading-[18px] tracking-[0.06em] cursor-pointer'
          />
        </form>
      )}

      <div className="qr-code-modal info-bubble hidden bg-white w-[60%] fixed z-[1] p-[30px] rounded-[30px] border-[1px] border-alto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <img src={qrCode} alt="QR Code" />
      </div>

      <div className='flex flex-col items-center gap-y-5 mt-[10px]'>
        <p className='font-medium text-[16px] leading-[27px] text-[rgba(0,0,0,0.5)]'>
          Balance
        </p>

        <img
          alt=''
          className='w-6 h-6 cursor-pointer'
          onClick={() => {
            setBalanceHidden(!balanceHidden);
            togglePassword(balanceRef);
          }}
          src={balanceHidden ? eyeImage : eyeSlashImage}
        />

        <input
          disabled
          value={balanceRef.current?.value || ''}
          type='password'
          ref={balanceRef}

          className='text-center outline-0 font-semibold text-[34px] leading-[41px] max-w-full'
        />
      </div>

      <div className='text-mine-shaft font-semibold text-[14px] leading-[17px] flex justify-between mt-[30px]'>
        <button
          onClick={() => showInfo({ classTarget: '.pay-modal' })}
          className='py-[14px] px-5 bg-[rgba(190,161,161,0.2)] rounded-[30px]'
        >
          Add money
        </button>

        <button className='py-[14px] px-5 bg-[rgba(190,161,161,0.2)] rounded-[30px]' onClick={() => navigate("/user/withdraw")}>
          Withdraw money
        </button>
      </div>




      <HistoryPanel history={history} />
    </main>
  );
};

export default Home;
