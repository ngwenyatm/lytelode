import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [nationalStatus, setNationalStatus] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedArea, setSelectedArea] = useState(null)
  const [areaInfo, setAreaInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [darkMode, setDarkMode] = useState(false)

  // Test if component mounts
  //console.log('App component rendering...')

  useEffect(() => {
    console.log('Component mounted')
    fetchNationalStatus()
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
  }, [darkMode])

  const fetchNationalStatus = async () => {
    try {
      setLoading(true)
      console.log('Fetching national status...')
      const response = await fetch('/api/status')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('National status data:', data)
      
      if (data.error) {
        setError('Failed to load national status')
      } else {
        setNationalStatus(data)
      }
    } catch (error) {
      console.error('Error fetching national status:', error)
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchText.trim()) return
    
    try {
      setLoading(true)
      setError('')
      setSearchResults([])
      
      const response = await fetch(`/api/area/search?q=${encodeURIComponent(searchText)}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.error) {
        setError(data.error)
        setSearchResults([])
      } else {
        setSearchResults(data.areas || [])
        if (data.areas.length === 0) {
          setError(`No areas found matching "${searchText}"`)
        }
      }
    } catch (error) {
      console.error('Error searching areas:', error)
      setError('Failed to search areas. Please try again.')
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleAreaSelect = async (areaId, areaName) => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch(`/api/area/${areaId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.error) {
        setError(data.error)
        setAreaInfo(null)
      } else {
        setAreaInfo(data)
        setSelectedArea(areaId)
        setSearchResults([])
      }
    } catch (error) {
      console.error('Error fetching area info:', error)
      setError('Failed to load area schedule. Please try again.')
      setAreaInfo(null)
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const clearSearch = () => {
    setSearchText('')
    setSearchResults([])
    setAreaInfo(null)
    setSelectedArea(null)
  }

  return (
    <div className="App">
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
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <i className="fas fa-lightbulb"></i>
            ) : (
              <i className="far fa-lightbulb"></i>
            )}
          </button>
        </div>
        <h1>Lytelode</h1>
        <p>Loadshedding Tracker for South Africa</p>
      </header>

      <main className="main-content">
        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            {error}
            <button className="error-close" onClick={() => setError('')}>×</button>
          </div>
        )}

        <section className="status-section">
          <h2>National Status</h2>
          {nationalStatus ? (
            <div className="status-card">
              <h3>Stage: {nationalStatus.status.eskom_stage}</h3>
              <p>Updated: {new Date(nationalStatus.status.timestamp).toLocaleString()}</p>
            </div>
          ) : (
            <div className="status-card">
              <p>Loading national status...</p>
            </div>
          )}
        </section>

        <section className="search-section">
          <h2>Find Your Area</h2>
          <div className="search-box">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Enter your area name (min. 3 characters)"
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
            <button onClick={handleSearch} disabled={loading || searchText.trim().length < 3}>
              {loading ? 'Searching...' : 'Search'}
            </button>
            {(searchText || areaInfo) && (
              <button onClick={clearSearch} className="clear-button" title="Clear search">
                ×
              </button>
            )}
          </div>

          {searchResults.length > 0 && (
            <div className="search-results">
              <h3>Search Results:</h3>
              <ul>
                {searchResults.map((area) => (
                  <li key={area.id}>
                    <button 
                      onClick={() => handleAreaSelect(area.id, area.name)}
                      className={selectedArea === area.id ? 'selected' : ''}
                      disabled={loading}
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
            <div className="area-header">
              <h2>Loadshedding Schedule for {areaInfo.info?.name}</h2>
              <button onClick={clearSearch} className="clear-area-button" title="Clear area">
                ×
              </button>
            </div>
            {areaInfo.events && areaInfo.events.length > 0 ? (
              <div className="schedule">
                <h3>Next scheduled events:</h3>
                <div className="events">
                  {areaInfo.events.slice(0, 5).map((event, index) => (
                    <div key={index} className="event-card">
                      <div className="event-card-header">
                        <div className="event-date">
                          {new Date(event.start).toLocaleDateString('en-ZA', { 
                            day: 'numeric', 
                            month: 'short' 
                          })}
                        </div>
                        <div className="event-day">
                          {new Date(event.start).toLocaleDateString('en-ZA', { weekday: 'short' })}
                        </div>
                      </div>
                      <div className="event-card-content">
                        <div className="event-time">
                          <i className="fas fa-clock"></i>
                          {formatTime(event.start)} - {formatTime(event.end)}
                        </div>
                        <div className="event-duration">
                          <i className="fas fa-hourglass-half"></i>
                          Duration: {Math.round((new Date(event.end) - new Date(event.start)) / (1000 * 60 * 60))} hours
                        </div>
                        <div className="event-stage">
                          Stage {event.stage || 'N/A'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="events-hint">
                  <i className="fas fa-arrows-alt-h"></i>
                  Scroll horizontally to see more events
                </div>
              </div>
            ) : (
              <div className="no-events">
                <i className="fas fa-check-circle"></i>
                <p>No loadshedding events scheduled for this area</p>
              </div>
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
            <p>Data provided by Eskom Se Push API • Lytelode</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App