import { ThemeProvider, createTheme, CssBaseline, GlobalStyles } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import AboutUsPage from './pages/AboutUsPage.jsx';
import FeaturesPage from './pages/FeaturesPage.jsx';
import HowItWorksPage from './pages/HowItWorksPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import PricingPage from './pages/PricingPage.jsx';
import ComingSoonPage from './pages/ComingSoonPage.jsx';
import InvoicingSystemCyprusPage from './pages/InvoicingSystemCyprusPage.jsx';
import FreelancerInvoicingPage from './pages/FreelancerInvoicingPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import Navbar from './components/ReusableComponents/Navbar.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import { AdminAuthProvider } from './contexts/AdminAuthContext.jsx';
import ProtectedAdminRoute from './components/ProtectedAdminRoute.jsx';

const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
      light: '#8b9bff',
      dark: '#4f46e5',
    },
    secondary: {
      main: '#764ba2',
      light: '#9c7fd4',
      dark: '#6b46c1',
    },
    background: {
      default: '#ffffff',
      paper: '#f8fafc',
    },
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    h1: {
      fontSize: '3.5rem',
      fontWeight: 800,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2.75rem',
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '2.25rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.875rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)',
    '0px 3px 6px rgba(0, 0, 0, 0.16), 0px 3px 6px rgba(0, 0, 0, 0.23)',
    '0px 10px 20px rgba(0, 0, 0, 0.19), 0px 6px 6px rgba(0, 0, 0, 0.23)',
    '0px 14px 28px rgba(0, 0, 0, 0.25), 0px 10px 10px rgba(0, 0, 0, 0.22)',
    '0px 19px 38px rgba(0, 0, 0, 0.30), 0px 15px 12px rgba(0, 0, 0, 0.22)',
    ...Array(19).fill('0px 19px 38px rgba(0, 0, 0, 0.30), 0px 15px 12px rgba(0, 0, 0, 0.22)'),
  ],
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          html: {
            boxSizing: 'border-box',
          },
          '*, *::before, *::after': {
            boxSizing: 'inherit',
          },
          body: {
            margin: 0,
            padding: 0,
            overflowX: 'hidden', // Prevent horizontal scroll
          },
          '#root': {
            width: '100%',
            minHeight: '100vh',
          },
        }}
      />
      <AdminAuthProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/system-management-portal-2025" element={
              <ProtectedAdminRoute>
                <AdminPage />
              </ProtectedAdminRoute>
            } />
            <Route path="/" element={<><Navbar /><HomePage /></>} />
            <Route path="/about" element={<><Navbar /><AboutUsPage /></>} />
            <Route path="/features" element={<><Navbar /><FeaturesPage /></>} />
            <Route path="/how-it-works" element={<><Navbar /><HowItWorksPage /></>} />
            <Route path="/pricing" element={<><Navbar /><PricingPage /></>} />
            <Route path="/contact" element={<><Navbar /><ContactPage /></>} />
            <Route path="/coming-soon" element={<><Navbar /><ComingSoonPage /></>} />
            <Route path="/invoicing-system-cyprus" element={<><Navbar /><InvoicingSystemCyprusPage /></>} />
            <Route path="/invoicing-system-freelancers" element={<><Navbar /><FreelancerInvoicingPage /></>} />
          </Routes>
        </Router>
      </AdminAuthProvider>
    </ThemeProvider>
  )
}

export default App
