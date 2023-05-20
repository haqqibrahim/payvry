import Cookies from 'js-cookie';
import { Link, useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';

import eyeImage from '../../assets/svgs/eye.svg';
import eyeSlashImage from '../../assets/svgs/eye-slash.svg';

import { showAlert, togglePassword } from '../../utils';
import { User, UserProfileUpdatePayload, UserResponse } from '../../interfaces';

import BackButton from '../../components/BackButton';

const Profile = () => {
  const navigate = useNavigate();
  const baseURL = process.env.REACT_APP_USER_API!;

  const [pwdHidden, setPwdHidden] = useState(true);

  const matricRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const fullNameRef = useRef<HTMLInputElement>(null);
  const phoneNumberRef = useRef<HTMLInputElement>(null);

  const updateProfile = () => {
    const generalInfoConfig: AxiosRequestConfig = {
      baseURL,
    };

    const payload: UserProfileUpdatePayload = {
      fullName: fullNameRef.current!.value,
      password: passwordRef.current!.value,
      phoneNumber: phoneNumberRef.current!.value,
      matricNumber: matricRef.current!.value.toLowerCase(),
    };

    axios
      .put('/update', payload, generalInfoConfig)
      .then(res => {
        showAlert({ msg: 'Your details have been updated!' });
        navigate('/user');
      })
      .catch((error: AxiosError) => showAlert({ msg: error.message }));
  };

  // componentDidMount
  useEffect(() => {
    const generalInfoConfig: AxiosRequestConfig = {
      baseURL,
    };
    const token: string | undefined = Cookies.get('token-payvry');

    if (!token) {
      showAlert({ msg: 'An error occured while accessing your details' });
      navigate('/user');
      return;
    }

    const payload = { token };

    axios
      .post('/user', payload, generalInfoConfig)
      .then(res => {
        const response: UserResponse = res.data;
        const { user } = response;
        const { fullName, matricNumber, phoneNumber } = user;

        fullNameRef.current!.defaultValue = fullName;
        matricRef.current!.defaultValue = matricNumber;
        phoneNumberRef.current!.defaultValue = phoneNumber;
      })
      .catch((error: AxiosError) => showAlert({ msg: error.message }));
  }, []);

  return (
    <main className='min-h-screen px-5 pt-14 pb-[100px] flex flex-col items-center'>
      <h1 className='font-semibold text-[20px] leading-[26px]'>Profile</h1>
      <BackButton />

      <div className='font-semibold text-[13px] leading-4 tracking-[0.06em] mt-[57px] max-w-[400px] flex flex-col gap-y-5'>
        <label htmlFor='matric'>
          <span className='mx-5'>Matric number</span>
          <input
            id='matric'
            type='text'
            ref={matricRef}
            autoCorrect='off'
            autoComplete='off'
            placeholder='Matric number'
            className='placeholder:text-mine-shaft bg-grey-200 w-full rounded-[100px] py-[15px] px-5 mt-[10px]'
          />
        </label>

        <label htmlFor='full-name'>
          <span className='mx-5'>Full name</span>
          <input
            id='full-name'
            type='text'
            ref={fullNameRef}
            autoCorrect='off'
            autoComplete='off'
            placeholder='Full name'
            className='placeholder:text-mine-shaft bg-grey-200 w-full rounded-[100px] py-[15px] px-5 mt-[10px]'
          />
        </label>

        <label htmlFor='phone'>
          <span className='mx-5'>Phone number</span>
          <input
            id='phone'
            type='text'
            ref={phoneNumberRef}
            autoCorrect='off'
            autoComplete='off'
            placeholder='Phone number'
            className='placeholder:text-mine-shaft bg-grey-200 w-full rounded-[100px] py-[15px] px-5 mt-[10px]'
          />
        </label>

        <label htmlFor='password' className='relative'>
          <span className='mx-5'>Password</span>
          <input
            id='password'
            type='password'
            ref={passwordRef}
            autoCorrect='off'
            autoComplete='off'
            placeholder='Password'
            className='placeholder:text-mine-shaft bg-grey-200 w-full rounded-[100px] py-[15px] px-5 mt-[10px]'
          />
          <img
            alt=''
            onClick={() => {
              togglePassword(passwordRef);
              setPwdHidden(!pwdHidden);
            }}
            src={pwdHidden ? eyeImage : eyeSlashImage}
            className='w-5 h-5 absolute top-[55%] right-[17px] cursor-pointer'
          />
        </label>

        <button
          onClick={updateProfile}
          className='bg-mine-shaft text-white w-full py-[15px] rounded-[100px] mt-[10px] font-medium text-[15px] leading-[18px]'
        >
          Update
        </button>

        <Link
          to='/user/update-pin'
          className='font-normal text-[14px] leading-7 tracking-[0.06em] text-mine-shaft text-center'
        >
          Update your pin
        </Link>
      </div>
    </main>
  );
};

export default Profile;
