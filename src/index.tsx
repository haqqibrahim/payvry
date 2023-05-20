import App from './App';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// For development
// import './main.css';

// For production
import './dist.css';

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
