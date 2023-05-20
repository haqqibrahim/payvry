import { Transaction } from '../../interfaces';

import searchImage from '../../assets/svgs/search.svg';

import StatHeading from '../../components/admin/StatHeading';

const Home = () => {
  const transactions: Transaction[] = [
    {
      to: 'Blosom kitchen',
      from: 'clu200203-442',
      paymentType: 'refund',
      userName: 'Korede Bakare',
      date: '2023-03-24T17:03:00Z',
    },
    {
      to: 'Blosom kitchen',
      from: 'clu200203-442',
      paymentType: 'purchase',
      userName: 'Korede Bakare',
      date: '2023-03-24T17:03:00Z',
    },
    {
      to: 'Blosom kitchen',
      from: 'clu200203-442',
      paymentType: 'withdrawal',
      userName: 'Korede Bakare',
      date: '2023-03-24T17:03:00Z',
    },
    {
      to: 'Blosom kitchen',
      from: 'clu200203-442',
      paymentType: 'account top-up',
      userName: 'Korede Bakare',
      date: '2023-03-24T17:03:00Z',
    },
  ];

  return (
    <main className='mt-[100px] mx-[95px] mb-[50px]'>
      <header className='flex'>
        <StatHeading title='All accounts Users' value={1932} />
        <StatHeading title='All transactions' value={12823823} />
        <StatHeading title='All profit earned' value={123822} />
        <StatHeading title='Active users today' value={1232} />
        <StatHeading title='Transactions today' value={238212} />
        <StatHeading title='Profit today' value={12029} />
      </header>

      <div className='relative'>
        <input
          type='text'
          placeholder="Search by students matric no or vendors' name"
          className='rounded-[30px] py-[14px] pr-[30px] pl-[66px] bg-wild-sand mt-[50px] w-full font-medium text-[16px] leading-[27px] placeholder:text-gray'
        />
        <img src={searchImage} className='absolute top-[65%] left-[30px]' alt='' />
      </div>

      <section>
        <header className='px-[34px] pb-5 mt-[50px] border-b-[1px] border-silver grid grid-cols-6 font-medium text-[16px] leading-[27px] text-[rgba(0,0,0,0.5)]'>
          <p>Transaction from</p>
          <p>Transaction to</p>
          <p>Student's name</p>
          <p>Payment type</p>
          <p>Date</p>
          <p>Time</p>
        </header>
        <div className='px-[34px] pt-[30px] font-medium text-[16px] leading-[27px] flex flex-col gap-y-5 capitalize'>
          {transactions.map(({ to, from, userName, date, paymentType }, index) => {
            const newDate = new Date(date);

            return (
              <div className='grid grid-cols-6' key={index}>
                <p className='uppercase'>{from}</p>
                <p>{to}</p>
                <p>{userName}</p>
                <p>{paymentType}</p>
                <p>{newDate.toDateString()}</p>
                <p>{newDate.toLocaleTimeString()}</p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
};

export default Home;
