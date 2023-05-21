import React from "react";

const Payment = () => {
  return (
   <main className="h-screen relative justify-center items-center w-screen bg-yellow-300 flex flex-col">
     <div className='inset-0 w-screen mx-auto h-[700px] bg-green-200 text-9xl text-red-500'>Payment</div>
      <div className='inset-x-0 bottom-0 h-[30px] space-x-5 bg-mine-shaft'>
        <button>Scan QR</button>
        <button>Text input</button>
      </div>
   </main>
  );
};

export default Payment;
