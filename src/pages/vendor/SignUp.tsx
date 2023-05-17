import { useRef, useState } from 'react';
import Cookies from 'js-cookie';
import { Link, useNavigate } from 'react-router-dom';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';

import { showAlert } from '../../utils';
import BackButton from '../../components/BackButton';

import { VendorSignupPayload, VendorTokenResponse } from '../../interfaces';
type Props = {
  children: React.ReactNode;
};
const SignUp = () => {
  const navigate = useNavigate();

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const vendorNameRef = useRef<HTMLInputElement>(null);
  const phoneNumberRef = useRef<HTMLInputElement>(null);
  const vendorOwnerRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const signUp = () => {
    setIsLoading(true);

    const generalInfoConfig: AxiosRequestConfig = {
      baseURL: process.env.REACT_APP_VENDOR_API!,
    };

    const payload: VendorSignupPayload = {
      password: passwordRef.current!.value,
      vendorName: vendorNameRef.current!.value,
      vendorUsername: usernameRef.current!.value,
      phoneNumber: phoneNumberRef.current!.value,
      vendorOwner: vendorOwnerRef.current!.value,
    };

    axios
      .post('/signup', payload, generalInfoConfig)
      .then(res => {
        const response: VendorTokenResponse = res.data;
        Cookies.set('token-payvry', response.token);
        navigate('/vendor/create-pin');
        setIsLoading(false);

      })
      .catch((error: AxiosError) => {
        const errorCode = error.response!.status;
        const msg = (error.response!.data as { message: string }).message;

        if (errorCode === 500) {
          showAlert({ msg: msg });
        } else {
          showAlert({ msg: error.message });
        }
        setIsLoading(false);
      });
  };

  return (
    <main className='w-screen min-h-screen px-[35px] pt-[4%] flex flex-col items-center justify-center sm-phones:pt-[30%]'>
      <h1 className='font-semibold text-[34px] leading-[44px] tracking-[0.04em] text-black'>
        Let's set up your account to get started
      </h1>
      <BackButton />

      <div className='font-light text-[13px] leading-4 tracking-[0.06em] mt-[54px] max-w-[400px]'>
        <input
          type='text'
          ref={usernameRef}
          autoCorrect='off'
          autoComplete='off'
          placeholder='Vendor username'
          className='placeholder:text-mine-shaft bg-grey-200 w-full rounded-[100px] py-[15px] px-5'
        />

        <input
          type='text'
          autoCorrect='off'
          autoComplete='off'
          ref={vendorNameRef}
          placeholder='Vendor name'
          className='placeholder:text-mine-shaft bg-grey-200 w-full rounded-[100px] py-[15px] px-5 mt-5'
        />

        <input
          type='text'
          autoCorrect='off'
          autoComplete='off'
          ref={vendorOwnerRef}
          placeholder="Vendor owner's name"
          className='placeholder:text-mine-shaft bg-grey-200 w-full rounded-[100px] py-[15px] px-5 mt-5'
        />

        <input
          type='text'
          autoCorrect='off'
          autoComplete='off'
          ref={phoneNumberRef}
          placeholder='Phone number'
          className='placeholder:text-mine-shaft bg-grey-200 w-full rounded-[100px] py-[15px] px-5 mt-5'
        />

        <input
          type='password'
          ref={passwordRef}
          placeholder='Password'
          className='placeholder:text-mine-shaft bg-grey-200 w-full rounded-[100px] py-[15px] px-5 mt-5'
        />

        {isLoading ? (
          <p>  <button disabled
            className='bg-mine-shaft text-white w-full py-[15px] rounded-[100px] mt-5'
          >
            Loading...
          </button></p>
        ) : (
          <div>  <button
            onClick={signUp}
            className='bg-mine-shaft text-white w-full py-[15px] rounded-[100px] mt-5'
          >
            Sign up
          </button></div>
        )}

        <p className='mt-5 font-normal text-[14px] leading-7 tracking-[0.06em] text-mine-shaft text-center'>
          Already have an account?{' '}
          <Link to='/vendor/login' className='font-bold'>
            Login
          </Link>
        </p>
      </div>
    </main>
  );
};

export default SignUp;
