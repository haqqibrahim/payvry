import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';

import eyeImage from '../../assets/svgs/eye.svg';
import eyeSlashImage from '../../assets/svgs/eye-slash.svg';

import { showAlert, togglePassword } from '../../utils';
import { VendorProfileUpdatePayload, VendorResponse } from '../../interfaces';

import BackButton from '../../components/BackButton';

const Profile = () => {
  const navigate = useNavigate();
  const baseURL = process.env.REACT_APP_VENDOR_API!;

  const [pwdHidden, setPwdHidden] = useState(true);

  const passwordRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const vendorNameRef = useRef<HTMLInputElement>(null);
  const phoneNumberRef = useRef<HTMLInputElement>(null);
  const vendorOwnerRef = useRef<HTMLInputElement>(null);

  const updateProfile = () => {
    const generalInfoConfig: AxiosRequestConfig = {
      baseURL,
    };

    const payload: VendorProfileUpdatePayload = {
      password: passwordRef.current!.value,
      vendorName: vendorNameRef.current!.value,
      vendorUsername: usernameRef.current!.value,
      phoneNumber: phoneNumberRef.current!.value,
      vendorOwner: vendorOwnerRef.current!.value,
    };

    // implement update of vendor's details using axios here
    axios
      .put('/update', payload, generalInfoConfig)
      .then(res => {
        showAlert({ msg: 'Your details have been updated!' });
        navigate('/vendor');
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
      navigate('/vendor');
      return;
    }

    const payload = { token };

    axios
      .post('/vendor', payload, generalInfoConfig)
      .then(res => {
        const response: VendorResponse = res.data;
        const { vendor } = response;
        const { phoneNumber, vendorName, vendorOwner, vendorUsername } = vendor;

        vendorNameRef.current!.defaultValue = vendorName;
        vendorOwnerRef.current!.defaultValue = vendorOwner;
        usernameRef.current!.defaultValue = vendorUsername;
        phoneNumberRef.current!.defaultValue = phoneNumber;
      })
      .catch((error: AxiosError) => showAlert({ msg: error.message }));
  }, []);

  return (
    <main className='min-h-screen px-5 pt-14 pb-[100px] flex flex-col items-center'>
      <h1 className='font-semibold text-[20px] leading-[26px]'>Profile</h1>
      <BackButton />

      <div className='font-semibold text-[13px] leading-4 tracking-[0.06em] mt-[57px] max-w-[400px] flex flex-col gap-y-5'>
        <label htmlFor='username'>
          <span className='mx-5'>Vendor username</span>
          <input
            id='username'
            type='text'
            ref={usernameRef}
            autoCorrect='off'
            autoComplete='off'
            placeholder="Vendor's username"
            className='placeholder:text-mine-shaft bg-grey-200 w-full rounded-[100px] py-[15px] px-5 mt-[10px]'
          />
        </label>

        <label htmlFor='vendor-name'>
          <span className='mx-5'>Vendor name</span>
          <input
            id='vendor-name'
            type='text'
            ref={vendorNameRef}
            autoCorrect='off'
            autoComplete='off'
            placeholder='Vendor name'
            className='placeholder:text-mine-shaft bg-grey-200 w-full rounded-[100px] py-[15px] px-5 mt-[10px]'
          />
        </label>

        <label htmlFor='vendor-owner-name'>
          <span className='mx-5'>Vendor owner's name</span>
          <input
            id='vendor-owner-name'
            type='text'
            ref={vendorOwnerRef}
            autoCorrect='off'
            autoComplete='off'
            placeholder="Vendor owner's name"
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
      </div>
    </main>
  );
};

export default Profile;
