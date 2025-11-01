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
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import SubscriptionPageWrapper from './pages/SubscriptionPage';
import TemplatesPage from './pages/TemplatesPage';
import ClientsPage from './pages/ClientsPage';
import ClientFormPage from './pages/ClientFormPage';
import ProductFormPage from './pages/ProductFormPage';
import TemplateFormPage from './pages/TemplateFormPage';
import UserManagementPage from './pages/UserManagementPage';
import UserFormPage from './pages/UserFormPage';
import SystemAdminPage from './pages/SystemAdminPage';
import SubscriptionGuard from './components/SubscriptionPage/SubscriptionGuard';
import SubscriptionBanner from './components/SubscriptionPage/SubscriptionBanner';
import AdminRoute from './components/ReusableComponents/AdminRoute';
import { SubscriptionProvider } from './utils/SubscriptionContext';
import { AuthProvider, useAuth } from './utils/AuthContext';
import './App.css';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import { SidebarProvider, SidebarContext } from './components/StaticComponents/SidebarContext';
import { useContext } from 'react';

function MainContent() {
  const { sidebarOpen } = useContext(SidebarContext);
  const { authenticated } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // On mobile, sidebar is always hidden from layout (drawer overlay)
  // On desktop, sidebar pushes content
  const drawerWidth = sidebarOpen ? 240 : 65;
  const shouldOffsetContent = authenticated && !isMobile;

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: 0,
        pl: shouldOffsetContent ? 2 : 0, // Add left padding to match right side
        ml: shouldOffsetContent ? `${drawerWidth}px` : 0,
        mt: isMobile ? '64px' : 0, // Top margin for mobile AppBar
        width: shouldOffsetContent ? `calc(100vw - ${drawerWidth}px)` : '100vw',
        height: isMobile ? 'calc(100vh - 64px)' : '100vh',
        overflow: 'auto',
        transition: 'margin 0.3s ease, width 0.3s ease',
        backgroundColor: '#f8fafc',
      }}
    >
      {authenticated && <SubscriptionBanner />}
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* Subscription Route - No guard needed */}
        <Route path="/subscription" element={<ProtectedRoute><SubscriptionPageWrapper /></ProtectedRoute>} />
        
        {/* Protected Routes with Subscription Guard */}
        <Route path="/" element={<ProtectedRoute><SubscriptionGuard><Homepage /></SubscriptionGuard></ProtectedRoute>} />
        <Route path="/invoice" element={<ProtectedRoute><SubscriptionGuard><InvoicePage /></SubscriptionGuard></ProtectedRoute>} />
        <Route path="/invoices" element={<ProtectedRoute><SubscriptionGuard><Homepage /></SubscriptionGuard></ProtectedRoute>} />
        <Route path="/invoices/create" element={<ProtectedRoute><SubscriptionGuard><InvoicePage /></SubscriptionGuard></ProtectedRoute>} />
        <Route path="/invoices/edit/:id" element={<ProtectedRoute><SubscriptionGuard><InvoicePage /></SubscriptionGuard></ProtectedRoute>} />
        <Route path="/invoices/view/:id" element={<ProtectedRoute><SubscriptionGuard><InvoiceViewPage /></SubscriptionGuard></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><SubscriptionGuard><DashboardPage /></SubscriptionGuard></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><SubscriptionGuard><ProductCatalogPage /></SubscriptionGuard></ProtectedRoute>} />
        <Route path="/clients" element={<ProtectedRoute><SubscriptionGuard><ClientsPage /></SubscriptionGuard></ProtectedRoute>} />
        <Route path="/clients/add" element={<ProtectedRoute><SubscriptionGuard><ClientFormPage /></SubscriptionGuard></ProtectedRoute>} />
        <Route path="/clients/edit/:id" element={<ProtectedRoute><SubscriptionGuard><ClientFormPage /></SubscriptionGuard></ProtectedRoute>} />
        <Route path="/products/add" element={<ProtectedRoute><SubscriptionGuard><ProductFormPage /></SubscriptionGuard></ProtectedRoute>} />
        <Route path="/products/edit/:id" element={<ProtectedRoute><SubscriptionGuard><ProductFormPage /></SubscriptionGuard></ProtectedRoute>} />
        <Route path="/templates" element={<ProtectedRoute><SubscriptionGuard><TemplatesPage /></SubscriptionGuard></ProtectedRoute>} />
        <Route path="/templates/add" element={<ProtectedRoute><SubscriptionGuard><TemplateFormPage /></SubscriptionGuard></ProtectedRoute>} />
        <Route path="/templates/edit/:id" element={<ProtectedRoute><SubscriptionGuard><TemplateFormPage /></SubscriptionGuard></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SubscriptionGuard><SystemSetupPage /></SubscriptionGuard></ProtectedRoute>} />
        <Route path="/report" element={<ProtectedRoute><SubscriptionGuard><ReportPage /></SubscriptionGuard></ProtectedRoute>} />
        
        {/* Routes that don't require subscription */}
        <Route path="/about" element={<ProtectedRoute><AboutUsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        
        {/* Admin Routes - Protected and require admin privileges */}
        <Route path="/admin/users" element={<ProtectedRoute><AdminRoute><UserManagementPage /></AdminRoute></ProtectedRoute>} />
        <Route path="/users/add" element={<ProtectedRoute><AdminRoute><UserFormPage /></AdminRoute></ProtectedRoute>} />
        <Route path="/users/edit/:id" element={<ProtectedRoute><AdminRoute><UserFormPage /></AdminRoute></ProtectedRoute>} />
        <Route path="/admin/system" element={<ProtectedRoute><AdminRoute><SystemAdminPage /></AdminRoute></ProtectedRoute>} />
      </Routes>
    </Box>
  );
}

function App() {
  return (
    <Router basename="/app">
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
    <Box sx={{ 
      display: 'flex',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0
    }}>
      {authenticated && <NavBar />}
      <MainContent />
    </Box>
  );
}

export default App;
