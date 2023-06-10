import React from 'react'
import { BsWhatsapp } from "react-icons/bs"
const Msg = () => {
  return (
    <div className="bg-white m-auto  flex flex-col items-center justify-center h-screen w-screen" >
      <p onClick={() => window.open("https://wa.me/2349057516507")}
        className="font-semibold text-[20px] leading-[26px] text-center text-green cursor-pointer"
      >
        Seems like we good here now, click to <br /> now return to WhatsApp 😌.
      </p>
      <BsWhatsapp className='cursor-pointer' style={{ color: "green", width: "10%", height: "10%", paddingTop: "10px" }} onClick={() => window.open("https://wa.me/2349057516507")} />

    </div>
  )
}

export default Msg