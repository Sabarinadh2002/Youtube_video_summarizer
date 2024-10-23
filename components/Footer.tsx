import { socialMedia } from '@/app/data'

import React from 'react'
import Image from 'next/image';


const Footer = () => {
  return (
    <footer className='w-full pt-20 pb-10'>
        <div className='flex mt-16 md:flex-row flex-col justify-between items-center'>
        <p className='md:text-base text-sm md:font-normal font-light'>
        Copyright © 2024 Sabarinadh Prasanthan
        </p>
        <div className='flex items-center md:gap-3 gap-6'>
        {socialMedia?.map((info) => (
            <div 
            key={info.id}
            className="w-10 h-10 cursor-pointer flex justify-center items-center backdrop-filter backdrop-blur-lg saturate-180 bg-opacity-75 bg-black-200 rounded-lg border border-black-300"
          >
             <Image src={info.img} alt="icons" width={20} height={20} />

        
        </div>
        ))}
        </div>
        </div>
    </footer>
  )
}

export default Footer