import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/StaticComponents/NavBar';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ReusableComponents/ProtectedRoute';
import Homepage from './pages/HomePage';
import InvoicePage from './pages/InvoicePage';
import SystemSetupPage from './pages/SystemSetupPage';
import AboutUsPage from './pages/AboutUsPage';
import InvoiceViewPage from './pages/InvoiceViewPage';
import DashboardPage from './pages/DashboardPage';
import ReportPage from './pages/ReportPage';
import ProductCatalogPage from './pages/ProductCatalogPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import SubscriptionPageWrapper from './pages/SubscriptionPage';
import TemplatesPage from './pages/TemplatesPage';
import ClientsPage from './pages/ClientsPage';
import SubscriptionGuard from './components/SubscriptionPage/SubscriptionGuard';
import SubscriptionBanner from './components/SubscriptionPage/SubscriptionBanner';
import { SubscriptionProvider } from './utils/SubscriptionContext';
import { AuthProvider, useAuth } from './utils/AuthContext';
import './App.css';
import { Box } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import { SidebarProvider, SidebarContext } from './components/StaticComponents/SidebarContext';
import { useContext } from 'react';

function MainContent() {
  const { sidebarOpen } = useContext(SidebarContext);
  const { authenticated } = useAuth();
  const drawerWidth = sidebarOpen ? 240 : 65;

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: authenticated ? 3 : 0,
        ml: authenticated ? `${drawerWidth}px` : 0,
        transition: 'margin 0.3s ease',
      }}
    >
      {authenticated && <SubscriptionBanner />}
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Subscription Route - No guard needed */}
        <Route path="/subscription" element={<ProtectedRoute><SubscriptionPageWrapper /></ProtectedRoute>} />
        
        {/* Protected Routes with Subscription Guard */}
        <Route path="/" element={<ProtectedRoute><SubscriptionGuard><Homepage /></SubscriptionGuard></ProtectedRoute>} />
        <Route path="/invoice" element={<ProtectedRoute><SubscriptionGuard><InvoicePage /></SubscriptionGuard></ProtectedRoute>} />
        <Route path="/invoices" element={<ProtectedRoute><SubscriptionGuard><Homepage /></SubscriptionGuard></ProtectedRoute>} />
        <Route path="/invoices/create" element={<ProtectedRoute><SubscriptionGuard><InvoicePage /></SubscriptionGuard></ProtectedRoute>} />
        <Route path="/invoices/edit/:id" element={<ProtectedRoute><SubscriptionGuard><InvoiceViewPage /></SubscriptionGuard></ProtectedRoute>} />
        <Route path="/invoices/view/:id" element={<ProtectedRoute><SubscriptionGuard><InvoiceViewPage /></SubscriptionGuard></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><SubscriptionGuard><DashboardPage /></SubscriptionGuard></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><SubscriptionGuard><ProductCatalogPage /></SubscriptionGuard></ProtectedRoute>} />
        <Route path="/templates" element={<ProtectedRoute><SubscriptionGuard><TemplatesPage /></SubscriptionGuard></ProtectedRoute>} />
        <Route path="/clients" element={<ProtectedRoute><SubscriptionGuard><ClientsPage /></SubscriptionGuard></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SubscriptionGuard><SystemSetupPage /></SubscriptionGuard></ProtectedRoute>} />
        <Route path="/report" element={<ProtectedRoute><SubscriptionGuard><ReportPage /></SubscriptionGuard></ProtectedRoute>} />
        
        {/* Routes that don't require subscription */}
        <Route path="/about" element={<ProtectedRoute><AboutUsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      </Routes>
    </Box>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <SubscriptionProvider>
          <SidebarProvider>
            <AppContent />
          </SidebarProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </Router>
  );
}

function AppContent() {
  const { authenticated } = useAuth();

  return (
    <Box sx={{ display: 'flex' }}>
      {authenticated && <NavBar />}
      <MainContent />
    </Box>
  );
}

export default App;
