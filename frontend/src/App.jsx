import React from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Register from './pages/Register'
import CheckIn from './pages/CheckIn'
import Analytics from './pages/Analytics'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <header className="glass-panel nav-bar">
          <h2 style={{ margin: 0, marginRight: 'auto', color: 'var(--accent-color)' }}>
            AI Attendance
          </h2>
          <NavLink to="/" className={({isActive}) => isActive ? "nav-link active" : "nav-link"} end>
            Check-In
          </NavLink>
          <NavLink to="/register" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            Register
          </NavLink>
          <NavLink to="/analytics" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            Analytics
          </NavLink>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<CheckIn />} />
            <Route path="/register" element={<Register />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
