
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add fade animations when components mount
import 'tailwindcss/tailwind.css'

const rootElement = document.getElementById("root")
if (!rootElement) throw new Error('Root element not found')

createRoot(rootElement).render(<App />)
