import { useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import Manager from './components/Manager'
import Footer from './components/Footer'

function App() {
  const [storageMode, setStorageMode] = useState("local")

  return (
    <div className="min-vh-100 bg-dark text-light d-flex flex-column">
      <Navbar storageMode={storageMode} setStorageMode={setStorageMode} />
      <div className="flex-grow-1">
        <Manager storageMode={storageMode} setStorageMode={setStorageMode} />
      </div>
      <Footer />
    </div>
  )
}

export default App
