import React, { Children } from 'react'
import Navbar from './Navbar'
import { useAuth } from '@/contexts/AuthContext'
import Sidebar from './Sidebar';

export default function Layout({children}) {

  const {isAuthenticated}= useAuth();


  return (
    <div className="min-h-screen bg-background" >
        <Navbar/>

        <div className='flex'>

          {isAuthenticated && <Sidebar/>}

            <main className={`flex-1  ${isAuthenticated ? 'p-6' : ''} `}>
                {children}
            </main>

        </div>
    </div>
  )
}
