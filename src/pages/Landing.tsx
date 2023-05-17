import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <main className='w-screen min-h-screen px-[35px] flex flex-col items-center justify-center'>
      <h1 className='font-semibold text-[34px] leading-[130%] tracking-[0.04em] text-black'>
        Welcome to <span className='text-fountain-blue'>Payvry!</span>
        <br /> Let's get you signed in
      </h1>

      <p className='pt-[21px] font-medium text-[16px] leading-[168%] tracking-[0.06em] text-[rgba(0,0,0,0.5)]'>
        You are one step away to creating your secure student to vendor payment system. Let's get to
        it already!
      </p>

      <div className='w-full mt-[70px] flex justify-between text-white font-semibold text-[18px] leading-[21px] max-w-[400px]'>
        <Link
          to='/user/login'
          className='w-[141px] h-[137px] rounded-[100px] grid place-items-center bg-fountain-blue'
        >
          Student
        </Link>

        <Link
          to='/vendor/login'
          className='w-[141px] h-[137px] rounded-[100px] grid place-items-center bg-mine-shaft'
        >
          Vendor
        </Link>
      </div>
    </main>
  );
};

export default Landing;
