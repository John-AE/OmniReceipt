import { createRoot } from 'react-dom/client'
import posthog from 'posthog-js'
import App from './App.tsx'
import './index.css'

// Initialize PostHog for session recording and analytics
posthog.init('POSTHOG PROJECT ID', {
    api_host: 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    session_recording: {
        maskAllInputs: false // Set to true if you want to mask sensitive inputs for privacy
    }
})

createRoot(document.getElementById("root")!).render(<App />);


