import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [nationalStatus, setNationalStatus] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedArea, setSelectedArea] = useState(null)
  const [areaInfo, setAreaInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    // Check if user has a dark mode preference saved
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  })

  useEffect(() => {
    fetchNationalStatus()
  }, [])

  useEffect(() => {
    // Apply dark mode class to body
    if (darkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
    // Save preference to localStorage
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const fetchNationalStatus = async () => {
    try {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1500));
      const response = await fetch('/api/status')
      const data = await response.json()
      setNationalStatus(data)
    } catch (error) {
      console.error('Error fetching national status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchText) return
    
    try {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000));
      const response = await fetch(`/api/area?text=${encodeURIComponent(searchText)}`)
      const data = await response.json()
      setSearchResults(data.areas || [])
    } catch (error) {
      console.error('Error searching areas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAreaSelect = async (areaId) => {
    try {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000));
      const response = await fetch(`/api/area/${areaId}`)
      const data = await response.json()
      setAreaInfo(data)
      setSelectedArea(areaId)
    } catch (error) {
      console.error('Error fetching area info:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-ZA', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  return (
    <div className="App">
      {/* Loader Overlay */}
      {loading && (
        <div className="loader-overlay">
          <div className="loader">
            <div className="loader-bolt">
              <i className="fas fa-bolt"></i>
            </div>
            <div className="loader-text">Loading power data...</div>
          </div>
        </div>
      )}
      
      <header className="App-header">
        <div className="header-top">
          <div className="logo">
            <i className="fas fa-bolt"></i>
          </div>
          <button 
            className="dark-mode-toggle"
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <i className="fas fa-sun"></i>
            ) : (
              <i className="fas fa-moon"></i>
            )}
          </button>
        </div>
        <h1>Lytelode</h1>
        <p>Loadshedding Tracker for South Africa</p>
      </header>

      <main className="main-content">
        <section className="status-section">
          <h2>National Status</h2>
          {nationalStatus ? (
            <div className="status-card">
              <h3>Stage: {nationalStatus.status.eskom_stage}</h3>
              <p>Updated: {new Date(nationalStatus.status.timestamp).toLocaleString()}</p>
            </div>
          ) : (
            <p>Unable to load status</p>
          )}
        </section>

        <section className="search-section">
          <h2>Find Your Area</h2>
          <div className="search-box">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Enter your area name"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} disabled={loading}>
              Search
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="search-results">
              <h3>Search Results:</h3>
              <ul>
                {searchResults.map((area) => (
                  <li key={area.id}>
                    <button 
                      onClick={() => handleAreaSelect(area.id)}
                      className={selectedArea === area.id ? 'selected' : ''}
                    >
                      {area.name} ({area.region})
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {areaInfo && (
          <section className="area-info-section">
            <h2>Loadshedding Schedule</h2>
            {areaInfo.events && areaInfo.events.length > 0 ? (
              <div className="schedule">
                <h3>Next events for {areaInfo.info.name}:</h3>
                <div className="events">
                  {areaInfo.events.slice(0, 5).map((event, index) => (
                    <div key={index} className="event-card">
                      <p><strong>Day:</strong> {new Date(event.start).toLocaleDateString()}</p>
                      <p><strong>Start:</strong> {formatTime(event.start)}</p>
                      <p><strong>End:</strong> {formatTime(event.end)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p>No loadshedding events scheduled</p>
            )}
          </section>
        )}
      </main>
      <footer>
        <div className="footer-content">
          <div className="footer-section">
            <h3>About Lytelode</h3>
            <p>Real-time loadshedding information for South Africa. Stay informed and plan ahead with accurate schedule data.</p>
          </div>
    
    <div className="footer-bottom">
      <p>Data provided by Eskom Se Push API • Lytelode © 2023</p>
    </div>
  </div>
</footer>
    </div>
  )
}

export default App