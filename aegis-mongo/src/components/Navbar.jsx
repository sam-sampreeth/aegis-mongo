import React, { useState } from 'react'

const Navbar = ({ storageMode, setStorageMode }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <nav className="navbar navbar-expand navbar-dark bg-dark border-bottom border-secondary-subtle py-2">
      <div className="container-md">
        <span className="navbar-brand mb-0 h1 text-white">Aegis</span>
        <div className="d-flex align-items-center gap-3 ms-auto">
          <div className="position-relative">
            <button
              className="btn btn-outline-light btn-sm dropdown-toggle"
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {storageMode === "local" ? "Local Storage" : "MongoDB (Local Server)"}
            </button>
            {dropdownOpen && (
              <ul className="dropdown-menu dropdown-menu-end show" style={{ position: 'absolute', right: 0, top: '100%', zIndex: 1000 }}>
                <li>
                  <button
                    className={`dropdown-item ${storageMode === "local" ? "active" : ""}`}
                    onClick={() => {
                      setStorageMode("local")
                      setDropdownOpen(false)
                    }}
                  >
                    Local Storage
                  </button>
                </li>
                <li>
                  <button
                    className={`dropdown-item ${storageMode === "mongo" ? "active" : ""}`}
                    onClick={() => {
                      setStorageMode("mongo")
                      setDropdownOpen(false)
                    }}
                  >
                    MongoDB (Local Server)
                  </button>
                </li>
              </ul>
            )}
          </div>

          <a
            href="https://github.com/sam-sampreeth/aegis-mongo"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
          >
            <img className="invert" src="/assets/github.png" alt="GitHub" width="16" height="16" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
