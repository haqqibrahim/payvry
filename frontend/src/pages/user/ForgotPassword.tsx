import React, { useRef, useState } from 'react'
import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';

import BackButton from '../../components/BackButton';
import { showAlert } from '../../utils';


const ForgotPassword = () => {
  const navigate = useNavigate();

  const [regLevel, setRegLevel] = useState(1);
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [matricNumber, setMatricNumber] = useState('')

  const otpRef = useRef<HTMLInputElement>(null);
  const matricNumberRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const password2Ref = useRef<HTMLInputElement>(null);

  const getOTP = () => {
    setIsLoading(true)
    const generalInfoConfig: AxiosRequestConfig = {
      baseURL: process.env.REACT_APP_USER_API!,
    };

    interface sendOTPPayload {
      matricNumber: string;
    }

    const payload: sendOTPPayload = {
      matricNumber: matricNumberRef.current!.value,
    }
console.log(payload)

    axios
      .post('/update/send-reset-otp', payload, generalInfoConfig)
      .then(res => {
        const response: { message: string } = res.data;
        showAlert({ msg: response.message });
        setOtpSent(true)
        setIsLoading(false);
        setMatricNumber(matricNumberRef.current!.value)
      })
      .catch((error: AxiosError) => {
        const errorCode = error.response!.status;
        const msg = (error.response!.data as { message: string }).message;

        if (errorCode === 500) showAlert({ msg });
        else showAlert({ msg: error.message });
        setOtpSent(false)

        setIsLoading(false);
      });
  }

  const levelOne = () => {
    setIsLoading(true)
    const generalInfoConfig: AxiosRequestConfig = {
      baseURL: process.env.REACT_APP_USER_API!,
    };

    interface verifyOTPpayload {
      matricNumber: string;
      otp: number;
    }

    const payload: verifyOTPpayload = {
      matricNumber: matricNumberRef.current!.value,
      otp: Number(otpRef.current!.value),
    }

console.log(payload)
    axios
      .post('/update/verify-otp', payload, generalInfoConfig)
      .then(res => {
        const response: { message: string } = res.data;
        showAlert({ msg: response.message });
        setIsLoading(false);
        setRegLevel(2)
      })
      .catch((error: AxiosError) => {
        const errorCode = error.response!.status;
        const msg = (error.response!.data as { message: string }).message;

        if (errorCode === 500) showAlert({ msg });
        else showAlert({ msg: error.message });

        setIsLoading(false);
      });
  }

  const levelTwo = () => {
    setIsLoading(true)
    const generalInfoConfig: AxiosRequestConfig = {
      baseURL: process.env.REACT_APP_USER_API!,
    };

    interface resetPasswordPayload {
      matricNumber: string;
      password: string;
    }

    const payload: resetPasswordPayload = {
      matricNumber: matricNumber.toLowerCase(),
      password: passwordRef.current!.value,
    }
    console.log(payload)


    axios
      .put('/update/change-password', payload, generalInfoConfig)
      .then(res => {
        const response: { message: string } = res.data;
        showAlert({ msg: response.message });
        setIsLoading(false);
        navigate("/user/login")
      })
      .catch((error: AxiosError) => {
        const errorCode = error.response!.status;
        const msg = (error.response!.data as { message: string }).message;

        if (errorCode === 500) showAlert({ msg });
        else showAlert({ msg: error.message });

        setIsLoading(false);
      });
  }


  const ResetPassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    if (otpSent === false) {
      getOTP()
    } else if

      (regLevel === 1) levelOne();
    else if (regLevel === 2) levelTwo();


  }
  return (
    <main className='w-screen min-h-screen px-[35px] flex flex-col items-center justify-center'>
      <h1 className='font-semibold text-[34px] leading-[44px] tracking-[0.04em] text-black'>
        Reset Login Password
      </h1>
      <BackButton />

      <form
        onSubmit={ResetPassword}
        className='font-light text-[13px] leading-4 tracking-[0.06em] mt-[54px] max-w-[400px] relative' style={{ marginBottom: "40px" }}
      >

        {
          regLevel === 1 && (
            <>
              <label htmlFor="number" className="text-mine-shaft mt-20" style={{ paddingLeft: "18px", paddingTop: "5px" }}>Enter matric number</label>
              <input
                required
                id="number"
                type='text'
                autoCorrect='off'
                autoComplete='off'
                ref={matricNumberRef}
                placeholder='Enter your matric number'
                className='placeholder:text-mine-shaft/50 text-left placeholder:text-left bg-grey-200 w-full rounded-[100px] py-[15px] px-5 mt-1'
              />
              {otpSent && (
                <input
                  required
                  type='text'
                  ref={otpRef}
                  placeholder='OTP from WhatsApp'
                  className='placeholder:text-mine-shaft bg-grey-200 w-full rounded-[100px] py-[15px] px-5 mt-5'
                />
              )}
            </>
          )
        }

        {regLevel === 2 && (
          <>
            <input
              required
              type='password'
              autoCorrect='off'
              autoComplete='off'
              ref={passwordRef}
              placeholder='Password'
              className='placeholder:text-mine-shaft bg-grey-200 w-full rounded-[100px] py-[15px] px-5 mt-5'
            />

            <input
              required
              type='password'
              ref={password2Ref}
              autoCorrect='off'
              autoComplete='off'
              placeholder='Confirm Password'
              className='placeholder:text-mine-shaft bg-grey-200 w-full rounded-[100px] py-[15px] px-5 mt-5'
            />




          </>
        )}



        <input
          type='submit'
          disabled={isLoading}
          value={isLoading ? 'Loading...' : regLevel < 2 ? 'Next' : 'Confirm'}
          className='bg-mine-shaft text-white w-full py-[15px] rounded-[100px] mt-5 cursor-pointer duration-500 disabled:cursor-default disabled:bg-opacity-40'
        />


      </form>

    </main>
  )
}

export default ForgotPassword