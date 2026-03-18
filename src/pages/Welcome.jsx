import React from 'react'
import { Routes, Route} from 'react-router-dom'
import Login from '../components/Login'
import './Welcome.css'

function Welcome() {
  return (
    <div className='welcome-container'>
      <div className='section-1'>
        <h1>Learnagram</h1>
        <p>Connect. Learn. Grow.</p>
      </div>
      <div className='enter-login'>
        <Routes>
          {/* default route */}
          <Route index element={<Login />} />
          {/* relative paths */}
          <Route path="login" element={<Login />} />
          
        </Routes>
      </div>

    </div>
  )
}

export default Welcome
