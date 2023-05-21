import Cookies from 'js-cookie';
import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';

import { togglePassword, showAlert } from '../../utils';

import eyeImage from '../../assets/svgs/eye.svg';
import eyeSlashImage from '../../assets/svgs/eye-slash.svg';

import BackButton from '../../components/BackButton';

import { UserLoginPayload, UserTokenResponse } from '../../interfaces';

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [pwdHidden, setPwdHidden] = useState(true);
  const matricRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const login = () => {
    setIsLoading(true);
    const generalInfoConfig: AxiosRequestConfig = {
      baseURL: process.env.REACT_APP_USER_API!,
    };
    console.log('2');

    const payload: UserLoginPayload = {
      password: passwordRef.current!.value,
      matricNumber: matricRef.current!.value.toLowerCase(),
    };
    console.log('3');

    axios
      .post('/login', payload, generalInfoConfig)
      .then(res => {
        console.log('4');

        const response: UserTokenResponse = res.data;
        Cookies.set('token-payvry', response.token);
        navigate('/user');
        setIsLoading(false);
      })
      .catch((error: AxiosError) => {
        const errorCode = error.response!.status;
        const msg = (error.response!.data as { message: string }).message;
        console.log('5');

        if (errorCode === 500) showAlert({ msg });
        else showAlert({ msg: error.message });

        setIsLoading(false);
      });
  };

  return (
    <main className='w-screen min-h-screen px-[35px] flex flex-col items-center justify-center'>
      <h1 className='font-semibold text-[34px] leading-[44px] tracking-[0.04em] text-black'>
        Just a little more
      </h1>

      <BackButton />

      <p className='font-medium text-[16px] leading-[27px] tracking-[0.06em] text-[rgba(0,0,0,0.5)] pt-[21px]'>
        You are one step away to a seamless payment experience.
      </p>

      <div className='relative font-light text-[13px] leading-4 tracking-[0.06em] mt-[54px]'>
        <input
          type='text'
          ref={matricRef}
          autoCorrect='off'
          autoComplete='off'
          placeholder='Matric number'
          className='placeholder:text-mine-shaft bg-grey-200 w-full rounded-[100px] py-[15px] px-5'
        />

        <input
          type='password'
          ref={passwordRef}
          placeholder='Password'
          className='placeholder:text-mine-shaft bg-grey-200 w-full rounded-[100px] py-[15px] px-5 mt-5'
        />
        <img
          alt=''
          onClick={() => {
            setPwdHidden(!pwdHidden);
            togglePassword(passwordRef);
          }}
          src={pwdHidden ? eyeImage : eyeSlashImage}
          className='absolute top-[33%] right-[5%] w-[19px] h-[13px] cursor-pointer'
        />

        <Link
          to='/forgot-password'
          className='block mr-auto ml-5 mt-[10px] font-light text-[12px] leading-[14px] text-mine-shaft cursor-pointer'
        >
          Forgot Password
        </Link>

        <button
          onClick={login}
          disabled={isLoading}
          className='bg-mine-shaft text-white w-full py-[15px] rounded-[100px] mt-[22px] font-medium text-[15px] leading-[18px] tracking-[0.06em]'
        >
          {isLoading ? 'Loading...' : 'Login'}
        </button>

        <p className='mt-5 font-normal text-[14px] leading-7 tracking-[0.06em] text-mine-shaft text-center'>
          Don't have an account?{' '}
          <Link to='/user/sign-up' className='font-bold'>
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
};

export default Login;
