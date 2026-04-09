import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DebugPage from './pages/DebugPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Debug view — temporary default during development */}
        <Route path="/" element={<DebugPage />} />
        {/* Home page — will be replaced by RF-01 landing page */}
        <Route path="/home" element={<div className="text-white">Home (RF-01 coming soon)</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App