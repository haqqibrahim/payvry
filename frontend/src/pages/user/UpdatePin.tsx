import Cookies from 'js-cookie';
import emailjs from '@emailjs/browser';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';

import BackButton from '../../components/BackButton';
import { decryptOtp, encryptOtp, formatInputText, getOtp, showAlert, showInfo } from '../../utils';

import { CreatePinPayload } from '../../interfaces';

const UpdatePin = () => {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');

  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    let newOtp: string | null = localStorage.getItem('otp-payvry');

    if (!newOtp) {
      newOtp = encryptOtp(getOtp(6));
      localStorage.setItem('otp-payvry', newOtp);
    }
  }, []);

  useEffect(() => {
    if (otp) sendOtp();
  }, [otp]);

  const setNewPin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const generalInfoConfig: AxiosRequestConfig = {
      baseURL: process.env.REACT_APP_USER_API!,
    };

    const token: string | undefined = Cookies.get('token-payvry');

    if (!token) {
      showInfo({});
      showAlert({ msg: 'An error occured while creating your pin' });
      navigate('/user/login');
      return;
    }

    const payload: CreatePinPayload = { token, pin };

    axios
      .post('/setpin', payload, generalInfoConfig)
      .then(res => {
        const response: { message: string } = res.data;

        showAlert({ msg: response.message });
        localStorage.removeItem('otp-payvry');
        navigate('/user');
      })
      .catch((error: AxiosError) => showAlert({ msg: error.message }));
  };

  const sendOtp = () => {
    const serviceID = process.env.REACT_APP_SERVICE_ID!;
    const publicKey = process.env.REACT_APP_PUBLIC_KEY!;
    const templateID = process.env.REACT_APP_TEMPLATE_ID!;

    emailjs
      .sendForm(serviceID, templateID, formRef.current!, publicKey)
      .then(() => {
        setOtp('');
        showInfo({ classTarget: '.confirm-otp-modal' });
        showAlert({ msg: `OTP has been sent to ${email}` });
      })
      .catch(() => showAlert({ msg: 'An error occured while sending email. Please try again' }));
  };

  const confirmOtp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const encryptedOtp: string = localStorage.getItem('otp-payvry')!;

    if (enteredOtp === decryptOtp(encryptedOtp)) {
      showAlert({ msg: 'Validation successful' });
      showInfo({ classTarget: '.set-pin-modal' });
    } else showAlert({ msg: 'Incorrect code' });
  };

  return (
    <main className='w-screen min-h-screen px-[35px] flex flex-col items-center justify-center'>
      <h1 className='font-semibold text-[34px] leading-[44px] tracking-[0.04em] text-black'>
        Enter your email to receive OTP
      </h1>
      <BackButton />

      <form
        onSubmit={setNewPin}
        className='set-pin-modal rounded-[30px] max-w-screen p-16 w-max hidden z-[1] bg-white info-bubble fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-light text-[13px] leading-4 tracking-[0.06em]'
      >
        <h1 className='font-semibold text-[34px] leading-[44px] tracking-[0.04em] text-black text-center'>
          Enter your new pin
        </h1>

        <input
          required
          minLength={6}
          maxLength={6}
          type='password'
          autoCorrect='off'
          autoComplete='off'
          placeholder='Enter new 6-digit pin'
          onChange={e =>
            setPin(formatInputText({ text: e.target.value, allowedChars: '0123456789' }))
          }
          className='placeholder:text-mine-shaft bg-grey-200 w-full rounded-[100px] py-[15px] px-5 mt-4'
        />

        <input
          type='submit'
          value='Confirm'
          className='cursor-pointer bg-mine-shaft text-white w-full py-[15px] rounded-[100px] mt-5 font-medium text-[15px] leading-[18px] tracking-[0.06em]'
        />
      </form>

      <form
        onSubmit={confirmOtp}
        className='confirm-otp-modal rounded-[30px] max-w-screen p-16 w-max hidden z-[1] bg-white info-bubble fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-light text-[13px] leading-4 tracking-[0.06em]'
      >
        <h1 className='font-semibold text-[34px] leading-[44px] tracking-[0.04em] text-black text-center'>
          Enter your OTP
        </h1>

        <input
          required
          type='text'
          autoCorrect='off'
          autoComplete='off'
          onChange={e => setEnteredOtp(e.target.value)}
          className='placeholder:text-mine-shaft bg-grey-200 w-full rounded-[100px] py-[15px] px-5 mt-4'
        />

        <input
          type='submit'
          value='Confirm'
          className='cursor-pointer bg-mine-shaft text-white w-full py-[15px] rounded-[100px] mt-5 font-medium text-[15px] leading-[18px] tracking-[0.06em]'
        />
      </form>

      <form
        ref={formRef}
        onSubmit={e => {
          e.preventDefault();

          const encryptedOtp = localStorage.getItem('otp-payvry')!;
          setOtp(decryptOtp(encryptedOtp));
        }}
        className='font-light text-[13px] leading-4 tracking-[0.06em] mt-4 max-w-[400px]'
      >
        <input
          required
          type='text'
          name='email'
          autoCorrect='off'
          autoComplete='off'
          placeholder='Enter your email address'
          onChange={e => setEmail(e.target.value)}
          className='placeholder:text-mine-shaft bg-grey-200 w-full rounded-[100px] py-[15px] px-5'
        />
        <input type='text' name='otp' className='hidden' readOnly value={otp} />

        <input
          type='submit'
          value='Confirm'
          className='cursor-pointer bg-mine-shaft text-white w-full py-[15px] rounded-[100px] mt-5 font-medium text-[15px] leading-[18px] tracking-[0.06em]'
        />
      </form>
    </main>
  );
};

export default UpdatePin;
