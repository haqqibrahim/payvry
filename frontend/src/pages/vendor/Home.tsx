import Cookies from 'js-cookie';
import { useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';

import eyeImage from '../../assets/svgs/eye.svg';
import userImage from '../../assets/svgs/user.svg';
import chatImage from '../../assets/svgs/chat.svg';
import eyeSlashImage from '../../assets/svgs/eye-slash.svg';

import { VendorHistoryData, VendorResponse } from '../../interfaces';
import { showAlert, togglePassword } from '../../utils';

import HistoryPanel from '../../components/vendor/HistoryPanel';
import { FiLogOut } from 'react-icons/fi';

const Home = () => {
  const navigate = useNavigate();

  const balanceRef = useRef<HTMLInputElement>(null);
  const [balanceHidden, setBalanceHidden] = useState(true);

  const [fullName, setFullName] = useState('');
  const [history, setHistory] = useState<VendorHistoryData[]>([]);

  // componentDidMount
  useEffect(() => {
    const generalInfoConfig: AxiosRequestConfig = {
      baseURL: process.env.REACT_APP_VENDOR_API!,
    };
    const token: string | undefined = Cookies.get('token-payvry');

    if (!token) {
      showAlert({ msg: 'An error occured while getting your details' });
      navigate('/vendor/login');
      return;
    }

    const payload = { token };

    axios
      .post('/vendor', payload, generalInfoConfig)
      .then(res => {
        const response: VendorResponse = res.data;
        const { vendor, vendorTransaction } = response;
        const { vendorUsername } = vendor;

        setFullName(vendorUsername);
        setHistory(vendorTransaction);
      })
      .catch((error: AxiosError) => showAlert({ msg: error.message }));

    axios
      .post('/balance', payload, generalInfoConfig)
      .then(res => {
        const response: { message: number } = res.data;
        const balance: number = response.message;

        balanceRef.current!.value = `N${balance.toLocaleString()}`;
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
  }, []);

  return (
    <main className='px-5 pt-[59px] tracking-[0.04em] pb-[57px]'>
      <header className='flex items-center justify-between text-center'>
        <Link
          to='/vendor/profile'
          className='w-[50px] h-[50px] rounded-full grid place-items-center border-[1px] border-alto'
        >
          <img src={userImage} alt='' />
        </Link>

        <h1 className='font-semibold text-[18px]  leading-[30px]'>Hello {fullName}</h1>

        <div
          onClick={() => {
            Cookies.set('token-payvry', "");
            navigate('/vendor/login');
          }}
          className='w-[50px] h-[50px] cursor-pointer rounded-full grid place-items-center border-[1px] border-alto'
        >
         <FiLogOut style={{color: "red"}}/>
        </div>
      </header>

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
        <Link
          to='/vendor/receive-money'
          className='py-[14px] px-5 bg-[rgba(190,161,161,0.2)] rounded-[30px]'
        >
          Receive payment
        </Link>

        {/* <button className='py-[14px] px-5 bg-[rgba(190,161,161,0.2)] rounded-[30px]'> */}
        <Link
          to='/vendor/withdraw'
          className='py-[14px] px-5 bg-[rgba(190,161,161,0.2)] rounded-[30px]'
        >
         Withdraw
        </Link>
        {/* </button> */}
      </div>

      <HistoryPanel history={history} />
    </main>
  );
};

export default Home;
