import React from 'react'
import { Meteors } from './ui/meteors'


const Card = () => {
  return (
    <div className='w-full py-16 flex justify-center items-center'>
        <div className='max-w-7xl w-full grid grid-cols-1 md:grid-cols-3 gap-8 px-5'>
            {/*card1*/}
            
              <div className='relative'>
              <Meteors number={10} className='absolute '/>
            <div className='bg-white dark:bg-black-100 p-6 rounded-lg shadow-lg'>
             <h2 className='text-2xl font-semibold mb-4 text-center'>
                How to Use - step 1
             </h2>
             <p className='text-center text-gray-700 dark:text-gray-300'>
                Copy the YouTube video link and past it on above box
             </p>
            
            </div>
            </div>

            {/*card2*/}
            <div className='relative'>
          
            <Meteors number={10} className='absolute ' />
            <div className="bg-white dark:bg-black-100 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-center">How to Use - Step 2</h2>
          <p className="text-center text-gray-700 dark:text-gray-300">
            Click on the "Generate Summary" button. The system will process the video and provide a concise summary.
          </p>
        </div>
        </div>
        

            {/*card3*/}
            <div className='relative'>
          
            <Meteors number={10} className='absolute' />
            <div className="bg-white dark:bg-black-100 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-center">How to Use - Step 3</h2>
          <p className="text-center text-gray-700 dark:text-gray-300">
            Review the generated summary and explore any translation features if needed.
          </p>
        </div>
        </div>
        

        </div>
    </div>
  )
}

export default Card