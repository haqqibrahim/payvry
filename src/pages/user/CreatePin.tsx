import Cookies from 'js-cookie';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';

import BackButton from '../../components/BackButton';
import { formatInputText, showAlert } from '../../utils';

import { CreatePinPayload } from '../../interfaces';
type Props = {
  children: React.ReactNode;
};

const CreatePin = () => {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const signIn = (e: React.FormEvent<HTMLFormElement>) => {
    setIsLoading(true);

    e.preventDefault();

    const generalInfoConfig: AxiosRequestConfig = {
      baseURL: process.env.REACT_APP_USER_API!,
    };
    const token: string | undefined = Cookies.get('token-payvry');

    if (!token) {
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
        navigate('/user');
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
    <main className='w-screen min-h-screen px-[35px] flex flex-col items-center justify-center'>
      <h1 className='font-semibold text-[34px] leading-[44px] tracking-[0.04em] text-black'>
        Let's create your 6-digit payment pin
      </h1>
      <BackButton />

      <p className='font-medium text-[16px] leading-[27px] tracking-[0.06em] text-[rgba(0,0,0,0.5)] pt-[21px]'>
        Your 6-digit pin will serve as your payment pin. Try not to disclose to anyone.
      </p>

      <form
        onSubmit={signIn}
        className='font-light text-[13px] leading-4 tracking-[0.06em] mt-[54px] max-w-[400px]'
      >
        <input
          required
          type='text'
          value={pin}
          minLength={6}
          maxLength={6}
          autoCorrect='off'
          autoComplete='off'
          placeholder='6-digit pin'
          onChange={e =>
            setPin(formatInputText({ text: e.target.value, allowedChars: '0123456789' }))
          }
          className='placeholder:text-mine-shaft bg-grey-200 w-full rounded-[100px] py-[15px] px-5'
        />


        {isLoading ? (
          <p>   <input
            type='submit'
            disabled
            value='Loading...'
            className='cursor-pointer bg-mine-shaft text-white w-full py-[15px] rounded-[100px] mt-5 font-medium text-[15px] leading-[18px] tracking-[0.06em]'
          /></p>
        ) : (
          <div>  <input
            type='submit'
            value='Sign in'
            className='cursor-pointer bg-mine-shaft text-white w-full py-[15px] rounded-[100px] mt-5 font-medium text-[15px] leading-[18px] tracking-[0.06em]'
          /></div>
        )}

      </form>
    </main>
  );
};

export default CreatePin;
