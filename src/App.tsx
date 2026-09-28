import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Home from './pages/Home';
import { SessionRoom } from './pages/SessionRoom';

function App() {
  return (
    <BrowserRouter>
      <Analytics />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/session/:sessionId' element={<SessionRoom />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
