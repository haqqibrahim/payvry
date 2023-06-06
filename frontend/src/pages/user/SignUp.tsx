import Cookies from 'js-cookie';
import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';

import eyeImage from '../../assets/svgs/eye.svg';
import eyeSlashImage from '../../assets/svgs/eye-slash.svg';

import {
  getOtp,
  showAlert,
  togglePassword,
  formatInputText,
  ascendingCountryCodes,
} from '../../utils';

import {
  CreatePinPayload,
  UserTokenResponse,
  UserSignupPayload1,
  UserSignupPayload2,
  VerifyNumberPayload,
} from '../../interfaces';

import countryInfo from '../../country_codes.json';

import BackButton from '../../components/BackButton';
import RegLevelIndicator from '../../components/RegLevelIndicator';

const SignUp = () => {
  const navigate = useNavigate();
  const [regLevel, setRegLevel] = useState(1);
  const [otpSent, setOtpSent] = useState(false);
  const [pinHidden, setPinHidden] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [number, setNumber] = useState('')

  const pinRef = useRef<HTMLInputElement>(null);
  const otpRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const fullNameRef = useRef<HTMLInputElement>(null);
  const phoneNumberRef = useRef<HTMLInputElement>(null);

  const [pin, setPin] = useState('');
  const levelRef = useRef<HTMLInputElement>(null);
  const matricRef = useRef<HTMLInputElement>(null);
  const departmentRef = useRef<HTMLInputElement>(null);

  const [otp] = useState<number>(Number(getOtp(6)));

  const signUp1 = () => {
    verifyNumber()
  }

  const signUp2 = () => {

    const generalInfoConfig: AxiosRequestConfig = {
      baseURL: process.env.REACT_APP_USER_API!,
    };

    const payload: UserSignupPayload1 = {
      email: emailRef.current!.value,
      fullName: fullNameRef.current!.value,
      password: passwordRef.current!.value,
      phoneNumber: number,
    };


    axios
      .post('/signup', payload, generalInfoConfig)
      .then(res => {
        const response: UserTokenResponse = res.data;
        Cookies.set('token-payvry', response.token);

        setRegLevel(3);
        setIsLoading(false);
      })
      .catch((error: AxiosError) => {
        const errorCode = error.response!.status;
        const msg = (error.response!.data as { message: string }).message;

        if (errorCode === 500) showAlert({ msg });
        else showAlert({ msg: error.message });

        setIsLoading(false);
      });
  };

  const signUp3 = () => {
    const generalInfoConfig: AxiosRequestConfig = {
      baseURL: process.env.REACT_APP_USER_API!,
    };

    const token: string | undefined = Cookies.get('token-payvry');

    if (!token) {
      showAlert({ msg: 'An error occured while accessing your details' });
      navigate('/user');
      return;
    }

    const payload: UserSignupPayload2 = {
      token,
      level: levelRef.current!.value,
      matricNumber: matricRef.current!.value.toLowerCase(),
      department: departmentRef.current!.value,
    };

    axios
      .post('/create-student', payload, generalInfoConfig)
      .then(() => {
        setRegLevel(4);
        setIsLoading(false);
      })
      .catch((error: AxiosError) => {
        const msg = (error.response!.data as { message: string }).message;

        showAlert({ msg });
        setIsLoading(false);
      });
  };

  const signUp4 = () => {
    const generalInfoConfig: AxiosRequestConfig = {
      baseURL: process.env.REACT_APP_USER_API!,
    };
    const token: string | undefined = Cookies.get('token-payvry');

    if (!token) {
      showAlert({ msg: 'An error occured while creating your pin' });
      navigate('/user');
      return;
    }

    const payload: CreatePinPayload = { token, pin };

    axios
      .post('/setpin', payload, generalInfoConfig)
      .then(res => {
        const response: { message: string } = res.data;

        showAlert({ msg: response.message });
        setIsLoading(false);
        navigate('/user');
      })
      .catch((error: AxiosError) => {
        const errorCode = error.response!.status;
        const msg = (error.response!.data as { message: string }).message;

        if (errorCode === 500) showAlert({ msg });
        else showAlert({ msg: error.message });

        setIsLoading(false);
      });
  };

  const signUp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (otpSent) {
      verifyOtp()
    } else if

      (regLevel === 1) signUp1();
    else if (regLevel === 2) signUp2();
    else if (regLevel === 3) signUp3();
    else if (regLevel === 4) signUp4();

  };

  const verifyNumber = () => {
    const generalInfoConfig: AxiosRequestConfig = {
      baseURL: process.env.REACT_APP_USER_API!,
    };

    const payload: VerifyNumberPayload = {
      phoneNumber: phoneNumberRef.current!.value,
    };

    axios
      .post('/verify-number', payload, generalInfoConfig)
      .then(res => {
        setOtpSent(true);
        const response: { message: string } = res.data;
        showAlert({ msg: response.message });
        setIsLoading(false);

      })
      .catch((error: AxiosError) => {
        const errorCode = error.response!.status;
        const msg = (error.response!.data as { message: string }).message;

        if (errorCode === 500) showAlert({ msg });
        else showAlert({ msg: error.message });

        setOtpSent(false);
        setIsLoading(false);

      });
  };

  const verifyOtp = () => {
    const generalInfoConfig: AxiosRequestConfig = {
      baseURL: process.env.REACT_APP_USER_API!,
    };

    interface payloadOtp {
      phoneNumber?: string,
      otp: Number
    }
    const payload: payloadOtp = {
      phoneNumber: phoneNumberRef.current!.value,
      otp: Number(otpRef.current!.value),
    }
    axios
      .post('/verify-otp', payload, generalInfoConfig)
      .then(res => {
        const response: { message: string } = res.data;
        showAlert({ msg: response.message });
        setIsLoading(false);
        setRegLevel(2)
        setOtpSent(false)
        setNumber(phoneNumberRef.current!.value)
      })
      .catch((error: AxiosError) => {
        const errorCode = error.response!.status;
        const msg = (error.response!.data as { message: string }).message;

        if (errorCode === 500) showAlert({ msg });
        else showAlert({ msg: error.message });

        setIsLoading(false);

      });
  }

  return (
    <main className='w-screen min-h-screen px-[35px] flex flex-col items-center justify-center'>
      <h1 className='font-semibold text-[34px] leading-[44px] tracking-[0.04em] text-black'>
        Let's set up your account to get started
      </h1>
      <BackButton />

      <form
        onSubmit={signUp}
        className='font-light text-[13px] leading-4 tracking-[0.06em] mt-[54px] max-w-[400px] relative' style={{marginBottom: "40px"}}
      >

        {
          regLevel === 4 && (
            <>
            <label htmlFor="number" className="text-mine-shaft mt-20"style={{paddingLeft: "18px", paddingTop: "5px"}}>Phone number</label>
              <input
                required
                id="number"
                type='text'
                autoCorrect='off'
                autoComplete='off'
                ref={phoneNumberRef}
                placeholder='Enter your whatsApp number'
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
              type='text'
              autoCorrect='off'
              autoComplete='off'
              ref={fullNameRef}
              placeholder='Full name'
              className='placeholder:text-mine-shaft bg-grey-200 w-full rounded-[100px] py-[15px] px-5 mt-5'
            />

            <input
              required
              type='email'
              ref={emailRef}
              autoCorrect='off'
              autoComplete='off'
              placeholder='Email address'
              className='placeholder:text-mine-shaft bg-grey-200 w-full rounded-[100px] py-[15px] px-5 mt-5'
            />


            <input
              required
              type='password'
              ref={passwordRef}
              placeholder='Password'
              className='placeholder:text-mine-shaft bg-grey-200 w-full rounded-[100px] py-[15px] px-5 mt-5'
            />

          </>
        )}

        {regLevel === 3 && (
          <>
            <input
              required
              type='text'
              ref={matricRef}
              autoCorrect='off'
              autoComplete='off'
              placeholder='Matric number'
              className='placeholder:text-mine-shaft bg-grey-200 w-full rounded-[100px] py-[15px] px-5 mt-5'
            />

            <input
              required
              type='text'
              autoCorrect='off'
              autoComplete='off'
              ref={departmentRef}
              placeholder='Department'
              className='placeholder:text-mine-shaft bg-grey-200 w-full rounded-[100px] py-[15px] px-5 mt-5'
            />

            <input
              required
              type='text'
              ref={levelRef}
              autoCorrect='off'
              autoComplete='off'
              placeholder='Level'
              className='placeholder:text-mine-shaft bg-grey-200 w-full rounded-[100px] py-[15px] px-5 mt-5'
            />
          </>
        )}

        {regLevel === 1 && (
          <>
            <input
              required
              value={pin}
              ref={pinRef}
              minLength={4}
              maxLength={4}
              type='password'
              autoCorrect='off'
              autoComplete='off'
              placeholder='Enter your 6-digit pin'
              onChange={e =>
                setPin(formatInputText({ text: e.target.value, allowedChars: '0123456789' }))
              }
              className='placeholder:text-mine-shaft bg-grey-200 w-full rounded-[100px] py-[15px] px-5'
            />
            <img
              alt=''
              onClick={() => {
                setPinHidden(!pinHidden);
                togglePassword(pinRef);
              }}
              src={pinHidden ? eyeImage : eyeSlashImage}
              style={{top: "10%"}}
              className='absolute right-[5%] w-[19px] h-[13px] cursor-pointer'
            />
          </>
        )}

        <input
          type='submit'
          disabled={isLoading}
          value={isLoading ? 'Loading...' : regLevel < 4 ? 'Next' : 'Sign up'}
          className='bg-mine-shaft text-white w-full py-[15px] rounded-[100px] mt-5 cursor-pointer duration-500 disabled:cursor-default disabled:bg-opacity-40'
        />

        <p className='mt-5 font-normal text-[14px] leading-7 tracking-[0.06em] text-mine-shaft text-center'>
          Already have an account?{' '}
          <Link to='/user/login' className='font-bold'>
            Login
          </Link>
        </p>
      </form>
              <RegLevelIndicator regLevel={regLevel} />

    </main>
  );
};

export default SignUp;
