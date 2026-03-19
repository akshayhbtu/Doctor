import React, { Children } from 'react'
import Navbar from './Navbar'

export default function Layout({children}) {
  return (
    <div className="min-h-screen bg-background" >
        <Navbar/>

        <div className='flex'>

            <main className='flex-1'>
                {children}
            </main>

        </div>
    </div>
  )
}
