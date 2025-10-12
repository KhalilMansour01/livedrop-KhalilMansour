import React, { useState } from 'react'
import { Header } from '../organisms/header'
import { SupportPanel } from '../organisms/support-panel'
import { Button } from '../atoms/button'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSupportOpen, setIsSupportOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <Header />
      
      <main className="relative w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      
      {/* Floating Support Button */}
      <div className="fixed bottom-8 right-8 z-40">
        <Button 
          onClick={() => setIsSupportOpen(true)}
          className="rounded-2xl px-6 py-4 shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-110 border-0 text-white font-bold"
        >
          <span className="flex items-center space-x-2">
            <span className="text-lg">💬</span>
            <span>Help</span>
          </span>
        </Button>
      </div>

      <SupportPanel 
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />
    </div>
  )
}

export default Layout