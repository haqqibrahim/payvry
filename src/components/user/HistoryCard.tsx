import { TransactionType } from '../../types';

import paidImage from '../../assets/svgs/paid.svg';
import receivedImage from '../../assets/svgs/received.svg';

interface Props {
  id: string;
  date: string;
  title: string;
  index: number;
  description: string;
  panelExpanded?: boolean;
  transactionAmount: number;
  transactionType: TransactionType;
}

const HistoryCard: React.FC<Props> = ({
  id,
  date,
  index,
  title,
  description,
  panelExpanded,
  transactionType,
  transactionAmount,
}) => {
  const newDate = new Date(date);

  return (
    <div
      className={`h-[103px] bg-white rounded-[20px] p-5 grid grid-rows-3 grid-cols-[40px_repeat(2,minmax(0,1fr))] font-medium text-[10px] leading-[17px] last:mb-0 ${
        index === 0 ? (panelExpanded ? 'mt-0' : 'mt-5') : ''
      } ${panelExpanded ? 'my-[10px]' : 'my-3'}`}
    >
      <p className='col-start-1 col-end-3 text-left'>
        {newDate.toDateString()} {newDate.toLocaleTimeString()}
      </p>
      <p className='text-right'>{id}</p>
      <img
        alt=''
        className='row-start-2 row-end-4 w-[30px] h-[30px] mt-[10%]'
        src={transactionType === 'credit' ? receivedImage : paidImage}
      />
      <p className='capitalize text-left font-normal'>{description}</p>
      <p
        className={`text-right ${
          transactionType === 'credit' ? 'text-mountain-meadow' : 'text-carnation'
        }`}
      >
        C{transactionAmount.toLocaleString()}
      </p>
      <p className='text-left text-[14px] leading-6 font-medium capitalize'>{title}</p>
      <p
        className={`capitalize text-right ${
          transactionType === 'credit' ? 'text-mountain-meadow' : 'text-carnation'
        }`}
      >
        {transactionType}
      </p>
    </div>
  );
};

export default HistoryCard;
