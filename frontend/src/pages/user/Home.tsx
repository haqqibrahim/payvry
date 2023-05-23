import Cookies from 'js-cookie';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';

import eyeImage from '../../assets/svgs/eye.svg';
import userImage from '../../assets/svgs/user.svg';
import chatImage from '../../assets/svgs/chat.svg';
import eyeSlashImage from '../../assets/svgs/eye-slash.svg';

import { showAlert, showInfo, togglePassword } from '../../utils';
import { UserHistoryData, UserResponse, UserTokenResponse } from '../../interfaces';

import HistoryPanel from '../../components/user/HistoryPanel';
import { FiLogOut } from 'react-icons/fi';


const Home = () => {
  const navigate = useNavigate();

  const balanceRef = useRef<HTMLInputElement>(null);
  const [balanceHidden, setBalanceHidden] = useState(true);

  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [fullName, setFullName] = useState('');
  const [history, setHistory] = useState<UserHistoryData[]>([]);
  const [phoneNumber, setPhoneNumber] = useState('')
  const [qrCode, setQrCode] = useState('')
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
        balanceRef.current!.value = `C${balance.toLocaleString()}`;
        console.log(balanceRef.current!.value)
      })
      .catch((error: AxiosError) => showAlert({ msg: error.message }));
  }, []);

  function generateRandomString(length: any) {
    const chars =
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = length; i > 0; --i) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }
  const transaction_ref: string = generateRandomString(10)
  const config = {
    public_key: process.env.REACT_APP_FLW_PUBLIC_KEY as string,
    tx_ref: transaction_ref,
    amount: Number(amount),
    currency: 'NGN',
    payment_options: 'card,mobilemoney,ussd,banktransfer,credit',
    customer: {
      email,
      phone_number: phoneNumber,
      name: fullName,
    },
    customizations: {
      title: 'Payvry Deposit',
      description: `Payvry Deposit for ${fullName}`,
      logo: ""
    },
  };

  interface UserDepositPayload {
    amount?: number,
    transaction_ref?: string,
    token?: string
  }

  const handleFlutterPayment = useFlutterwave(config);



  const payment = (amount: number, transaction_ref: string) => (e: React.FormEvent<HTMLFormElement>) => {
    const generalInfoConfig: AxiosRequestConfig = {
      baseURL: process.env.REACT_APP_USER_API!,
    };

    const token: string | undefined = Cookies.get('token-payvry');

    const payload: UserDepositPayload = {
      amount: Number(amount),
      transaction_ref,
      token
    };
    axios
      .post('/deposit', payload, generalInfoConfig)
      .then(res => {
        const response: any = res.data;
        showAlert({ msg: response.message })
        navigate("/user")
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
        setQrCode(response.qrCode)
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
         <FiLogOut style={{color: "red"}}/>
        </div>
      </header>

      <form

        onSubmit={(e) => {
          e.preventDefault()

          handleFlutterPayment({
            callback: (response) => {
              console.log(response);
              if (response.status === 'completed' || response.status === 'successful'
              ) {
                const generalInfoConfig: AxiosRequestConfig = {
                  baseURL: process.env.REACT_APP_USER_API!,
                };

                const token: string | undefined = Cookies.get('token-payvry');

                const payload: UserDepositPayload = {
                  amount: response.amount,
                  transaction_ref: response.flw_ref,
                  token
                };
                axios
                  .post('/deposit', payload, generalInfoConfig)
                  .then(res => {
                    console.log("4")
                    const response: any = res.data;
                    showAlert({ msg: response.message })
                    showInfo({})
                    window.location.reload();


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
              closePaymentModal()
              // this will close the modal programmatically
              navigate('/user', { replace: true });
            },
            onClose: () => {
              showAlert({ msg: "Deposit Cancelled" })
            },
          });
        }} className='info-bubble pay-modal text-center hidden bg-white w-[370px] fixed z-[1] p-[30px] rounded-[30px] border-[1px] border-alto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
      >
        <h4 className='font-semibold text-[18px]'>Payvry Deposit</h4>

        <label htmlFor='email' className='text-left mt-5 block'>
          <span className='block mx-3'>Email</span>
          <input
            required
            type='email'
            id='email'
            name='email'
            onChange={e => setEmail(e.target.value)}
            className='placeholder:text-mine-shaft bg-grey-200 w-full rounded-[100px] py-[10px] px-5 mt-1'
          />
        </label>

        <label htmlFor='amount' className='text-left mt-5 block'>
          <span className='block mx-3'>Amount paid</span>
          <input
            required
            type='text'
            id='amount'
            name='amount'
            onChange={e => setAmount(e.target.value)}
            className='placeholder:text-mine-shaft bg-grey-200 w-full rounded-[100px] py-[10px] px-5 mt-1'
          />
        </label>

        <input
          type='submit'
          value='Deposit'
          className='bg-mine-shaft text-white w-full py-[15px] rounded-[100px] mt-[22px] font-medium text-[15px] leading-[18px] tracking-[0.06em] cursor-pointer'
        />
      </form>

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
