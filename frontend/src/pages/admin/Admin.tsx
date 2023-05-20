import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const passwordRef = useRef<HTMLInputElement>(null);
  const naviagte = useNavigate();

  const signIn = () => {
    // logic for sign-in goes HomeVendor
    naviagte('/admin/home');
  };

  return (
    <main className='text-center flex items-center justify-center min-h-screen'>
      <div className='max-w-[400px]'>
        <h1 className='font-semibold text-[34px] leading-[44px]'>Admin site</h1>
        <p className='mt-[21px] font-medium text-[16px] leading-[27px] text-[rgba(0,0,0,0.5)]'>
          Enter the admin passcode to continue
        </p>
        <input
          type='password'
          ref={passwordRef}
          placeholder='Password'
          className='mt-[54px] rounded-[100px] bg-gallery py-[15px] px-[20px] w-full placeholder:text-mine-shaft placeholder:font-light text-[13px] leading-4 tracking-[0.06em] '
        />
        <button
          className='mt-5 font-medium text-[15px] leading-[18px] text-white rounded-[100px] bg-mine-shaft py-[15px] w-full'
          onClick={signIn}
        >
          Sign in
        </button>
      </div>
    </main>
  );
};

export default Admin;
