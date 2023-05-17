import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { useRef, useState, useMemo } from 'react';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';

import eyeImage from '../../assets/svgs/eye.svg';
import payFailImage from '../../assets/svgs/pay-fail.svg';
import eyeSlashImage from '../../assets/svgs/eye-slash.svg';
import paySuccessImage from '../../assets/svgs/pay-success.svg';

import BackButton from '../../components/BackButton';

import { showAlert, togglePassword } from '../../utils';
import { PaymentPayload, PaymentResponse, VerifyAccountPayload } from '../../interfaces';

const Withdraw = () => {
  const navigate = useNavigate();
  const pinRef = useRef<HTMLInputElement>(null);
  const baseURL = process.env.REACT_APP_USER_API!;

  const [amount, setAmount] = useState(0);
  const [pinHidden, setPinHidden] = useState(true);
  const [account_number, setAccountNumber] = useState('');
  const [searchBank, setBank] = useState('')
  const [account_bank, setAccountBank] = useState('')
  const [paymentMade, setPaymentMade] = useState(false);
  const [accountVerified, setAccountVerified] = useState(false);
  const [verifiedOwnerName, setVerifiedOwnerName] = useState('');
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const newDate = useMemo(() => new Date(), [paymentSuccessful]);
  const paymentID = useMemo(() => 'D32SASFGD243DF', [paymentSuccessful]);

  const dataResponse: DataResponse = {
    "status": "success",
    "message": "Banks fetched successfully",
    "data": [
      {
        "id": 132,
        "code": "560",
        "name": "Page MFBank"
      },
      {
        "id": 133,
        "code": "304",
        "name": "Stanbic Mobile Money"
      },
      {
        "id": 134,
        "code": "308",
        "name": "FortisMobile"
      },
      {
        "id": 135,
        "code": "328",
        "name": "TagPay"
      },
      {
        "id": 136,
        "code": "309",
        "name": "FBNMobile"
      },
      {
        "id": 137,
        "code": "011",
        "name": "First Bank of Nigeria"
      },
      {
        "id": 138,
        "code": "326",
        "name": "Sterling Mobile"
      },
      {
        "id": 139,
        "code": "990",
        "name": "Omoluabi Mortgage Bank"
      },
      {
        "id": 140,
        "code": "311",
        "name": "ReadyCash (Parkway)"
      },
      {
        "id": 141,
        "code": "057",
        "name": "Zenith Bank"
      },
      {
        "id": 142,
        "code": "068",
        "name": "Standard Chartered Bank"
      },
      {
        "id": 143,
        "code": "306",
        "name": "eTranzact"
      },
      {
        "id": 144,
        "code": "070",
        "name": "Fidelity Bank"
      },
      {
        "id": 145,
        "code": "023",
        "name": "CitiBank"
      },
      {
        "id": 146,
        "code": "215",
        "name": "Unity Bank"
      },
      {
        "id": 147,
        "code": "323",
        "name": "Access Money"
      },
      {
        "id": 148,
        "code": "302",
        "name": "Eartholeum"
      },
      {
        "id": 149,
        "code": "324",
        "name": "Hedonmark"
      },
      {
        "id": 150,
        "code": "325",
        "name": "MoneyBox"
      },
      {
        "id": 151,
        "code": "301",
        "name": "JAIZ Bank"
      },
      {
        "id": 152,
        "code": "050",
        "name": "Ecobank Plc"
      },
      {
        "id": 153,
        "code": "307",
        "name": "EcoMobile"
      },
      {
        "id": 154,
        "code": "318",
        "name": "Fidelity Mobile"
      },
      {
        "id": 155,
        "code": "319",
        "name": "TeasyMobile"
      },
      {
        "id": 156,
        "code": "999",
        "name": "NIP Virtual Bank"
      },
      {
        "id": 157,
        "code": "320",
        "name": "VTNetworks"
      },
      {
        "id": 158,
        "code": "221",
        "name": "Stanbic IBTC Bank"
      },
      {
        "id": 159,
        "code": "501",
        "name": "Fortis Microfinance Bank"
      },
      {
        "id": 160,
        "code": "329",
        "name": "PayAttitude Online"
      },
      {
        "id": 161,
        "code": "322",
        "name": "ZenithMobile"
      },
      {
        "id": 162,
        "code": "303",
        "name": "ChamsMobile"
      },
      {
        "id": 163,
        "code": "403",
        "name": "SafeTrust Mortgage Bank"
      },
      {
        "id": 164,
        "code": "551",
        "name": "Covenant Microfinance Bank"
      },
      {
        "id": 165,
        "code": "415",
        "name": "Imperial Homes Mortgage Bank"
      },
      {
        "id": 166,
        "code": "552",
        "name": "NPF MicroFinance Bank"
      },
      {
        "id": 167,
        "code": "526",
        "name": "Parralex"
      },
      {
        "id": 168,
        "code": "035",
        "name": "Wema Bank"
      },
      {
        "id": 169,
        "code": "084",
        "name": "Enterprise Bank"
      },
      {
        "id": 170,
        "code": "063",
        "name": "Diamond Bank"
      },
      {
        "id": 171,
        "code": "305",
        "name": "Paycom"
      },
      {
        "id": 172,
        "code": "100",
        "name": "SunTrust Bank"
      },
      {
        "id": 173,
        "code": "317",
        "name": "Cellulant"
      },
      {
        "id": 174,
        "code": "401",
        "name": "ASO Savings and & Loans"
      },
      {
        "id": 175,
        "code": "030",
        "name": "Heritage"
      },
      {
        "id": 176,
        "code": "402",
        "name": "Jubilee Life Mortgage Bank"
      },
      {
        "id": 177,
        "code": "058",
        "name": "GTBank Plc"
      },
      {
        "id": 178,
        "code": "032",
        "name": "Union Bank"
      },
      {
        "id": 179,
        "code": "232",
        "name": "Sterling Bank"
      },
      {
        "id": 180,
        "code": "076",
        "name": "Polaris Bank"
      },
      {
        "id": 181,
        "code": "082",
        "name": "Keystone Bank"
      },
      {
        "id": 182,
        "code": "327",
        "name": "Pagatech"
      },
      {
        "id": 183,
        "code": "559",
        "name": "Coronation Merchant Bank"
      },
      {
        "id": 184,
        "code": "601",
        "name": "FSDH"
      },
      {
        "id": 185,
        "code": "313",
        "name": "Mkudi"
      },
      {
        "id": 186,
        "code": "214",
        "name": "First City Monument Bank"
      },
      {
        "id": 187,
        "code": "314",
        "name": "FET"
      },
      {
        "id": 188,
        "code": "523",
        "name": "Trustbond"
      },
      {
        "id": 189,
        "code": "315",
        "name": "GTMobile"
      },
      {
        "id": 190,
        "code": "033",
        "name": "United Bank for Africa"
      },
      {
        "id": 191,
        "code": "044",
        "name": "Access Bank"
      },

    ]
  }

  const [account_name, setAccountName] = useState('')

  interface Bank {
    id: number;
    code: string;
    name: string;
  }

  interface DataResponse {
    status: string;
    message: string;
    data: Bank[];
  }

  const verifyAccount = async () => {
    setIsLoading(true);
    const generalInfoConfig: AxiosRequestConfig = {
      baseURL,
    };

    const token: string | undefined = Cookies.get('token-payvry');

    if (!token) {
      showAlert({ msg: 'An error occured while accessing your details' });
      navigate('/vendor');
      return;
    }
    const bank: Bank | undefined = dataResponse.data.filter((bank: Bank) => {
      return bank.name.toLowerCase() === searchBank.toLowerCase();
    })[0];

    if (bank) {
      console.log(`Found bank with id ${bank.id} and code ${bank.code}`);
      setAccountBank(bank.code)
      makePayment()
      setIsLoading(false)
    } else {
      showAlert({ msg: "Bank not found" })
      console.log("Bank not found");
      setIsLoading(false)
    }


  };

  const makePayment = () => {
    setIsLoading(true);
    const generalInfoConfig: AxiosRequestConfig = {
      baseURL,
    };

    const token: string | undefined = Cookies.get('token-payvry');

    if (!token) {
      showAlert({ msg: 'An error occured while accessing your details' });
      navigate('/vendor');
      return;
    }

    interface paymentPayLoad {
      token?: string,
      account_number?: string
      amount?: number
      account_bank?: string
      account_name?: string
    }

    const payload: paymentPayLoad = {
      token,
      account_number,
      amount: amount,
      account_bank,
      account_name
    };

    console.log(payload)

    axios
      .post('/withdraw', payload, generalInfoConfig)
      .then(res => {
        const response: PaymentResponse = res.data;
        showAlert({ msg: response.message });
        navigate("/vendor")
        // setPaymentSuccessful(true);
      })

      .catch((error: AxiosError) => {
        const errorCode = error.response!.status;
        const msg = (error.response!.data as { message: string }).message;
        console.log(error)
        if (errorCode === 500) {

          showAlert({ msg: msg });
          // setPaymentSuccessful(false);

        } else {

          showAlert({ msg: msg });
          // setPaymentSuccessful(false);

        }
        // setIsLoading(false);

      });
    // setPaymentMade(true);
  };

  return (
    <main className='min-h-screen px-5 mb-[100px] flex flex-col items-center justify-center'>
      <h1 className='font-semibold text-[20px] leading-[26px] text-center pt-14'>
        Withdraw Funds
      </h1>
      <BackButton />
      {/* 
      {paymentMade ? (
        <section className='mt-[180px] bg-alto rounded-[30px] p-[10px]'>
          <div className='grid grid-cols-3 gap-y-[15px] bg-white rounded-[20px] py-5 px-[30px] font-medium'>
            <p className='col-start-1 col-end-3 text-[10px] leading-[17px]'>
              {newDate.toDateString()} {newDate.toLocaleTimeString()}
            </p>
            <p className='text-[10px] leading-[17px] text-right'>{paymentID}</p>

            <img
              alt=''
              className='w-[30px] h-[30px] col-start-1 col-end-4 mx-auto'
              src={paymentSuccessful ? paySuccessImage : payFailImage}
            />
            <p
              className={`col-start-1 col-end-4 text-center font-semibold text-[24px] leading-10 ${paymentSuccessful ? 'text-mountain-meadow' : 'text-carnation'
                }`}
            >
              C{amount.toLocaleString()}
            </p>

            <p className='col-start-1 col-end-3 text-[14px] leading-6'>{account_number}</p>
            <p
              className={`text-right text-[14px] leading-6 ${paymentSuccessful ? 'text-mountain-meadow' : 'text-carnation'
                }`}
            >
              {paymentSuccessful ? 'Payment Successful' : 'Payment Unsuccessful'}
            </p>
          </div>
        </section>
      ) : ( 
        // */}
      <section className='mt-[180px] border-[1px] border-alto rounded-[30px] p-[30px] max-w-[400px]'>
        <h2 className='font-medium text-[16px] leading-[27px] text-[rgba(0,0,0,0.5)]'>
        we get your payments to you, any time you like
        </h2>

        <input
          type='text'
          placeholder='Account Number'
          onChange={e => {
            setAccountNumber(e.target.value);
            setAccountVerified(false);
            setVerifiedOwnerName('');
          }}
          className='mt-[30px] bg-gallery rounded-[100px] py-[15px] px-5 w-full placeholder:font-light text-[13px] leading-4 placeholder:text-mine-shaft tracking-[0.06em]'
        />

        <input
          type='text'
          placeholder='Bank Name in Full'
          onChange={e => setBank(e.target.value)}
          className='mt-5 bg-gallery rounded-[100px] py-[15px] px-5 w-full placeholder:font-light text-[13px] leading-4 placeholder:text-mine-shaft tracking-[0.06em]'
        />

        <input
          type='text'
          placeholder='Name on Account'
          onChange={e => setAccountName(e.target.value)}
          className='mt-5 bg-gallery rounded-[100px] py-[15px] px-5 w-full placeholder:font-light text-[13px] leading-4 placeholder:text-mine-shaft tracking-[0.06em]'
        />
        <input
          type='text'
          placeholder='Amount to withdraww'
          onChange={e => setAmount(Number(e.target.value))}
          className='mt-5 bg-gallery rounded-[100px] py-[15px] px-5 w-full placeholder:font-light text-[13px] leading-4 placeholder:text-mine-shaft tracking-[0.06em]'
        />
        {accountVerified && (
          <>
            <p className='mt-[30px] text-center font-medium text-[20px] leading-[26px]'>
              {verifiedOwnerName}
            </p>

            <div className='relative mt-[30px]'>
              <input
                type='password'
                ref={pinRef}
                placeholder='Pin'
                className='bg-gallery rounded-[100px] py-[15px] px-5 w-full placeholder:font-light text-[13px] leading-4 placeholder:text-mine-shaft tracking-[0.06em]'
              />
              <img
                alt=''
                onClick={() => {
                  togglePassword(pinRef);
                  setPinHidden(!pinHidden);
                }}
                src={pinHidden ? eyeImage : eyeSlashImage}
                className='w-5 h-5 absolute top-[30%] right-5 cursor-pointer'
              />
            </div>
          </>
        )}

        {isLoading ? (
          <p>   <button
            disabled className='bg-mine-shaft rounded-[100px] py-[15px] px-[88px] whitespace-nowrap text-white mt-[30px] font-medium text-[15px] leading-[18px] tracking-[0.06em] w-full'
          >
            Loading...
          </button></p>
        ) : (
          <div>  <button
            onClick={verifyAccount}
            className='bg-mine-shaft rounded-[100px] py-[15px] px-[88px] whitespace-nowrap text-white mt-[30px] font-medium text-[15px] leading-[18px] tracking-[0.06em] w-full'
          >
            Proceed to withdraw
          </button></div>
        )}

      </section>
      {/* )} */}
    </main>
  );
};

export default Withdraw;
