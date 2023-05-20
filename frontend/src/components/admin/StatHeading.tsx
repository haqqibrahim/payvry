interface Props {
  value: number;
  title: string;
}

const StatHeading: React.FC<Props> = ({ title, value }) => {
  return (
    <div className='text-center border-x-[1px] px-[2%] border-x-silver flex-1 first:border-l-transparent first:pl-0 last:border-r-transparent last:pr-0'>
      <p className='font-semibold text-[34px] leading-[44px]'>{value}</p>
      <p className='font-medium text-[16px] leading-[27px] text-[rgba(0,0,0,0.5)]'>{title}</p>
    </div>
  );
};

export default StatHeading;
