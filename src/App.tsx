import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import { SessionRoom } from './pages/SessionRoom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/session/:sessionId' element={<SessionRoom />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
