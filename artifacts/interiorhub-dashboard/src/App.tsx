import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import LoginPage from '@/pages/auth';
import { AdminDashboard, AdminProjectsPage, CategoriesPage, ContactRequestsPage, EngineerProfilePage, EngineerProjectsPage, EngineersPage, HomeRedirect, ProjectDetailPage } from '@/pages/dashboard-pages';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
          <Route path="/" component={HomeRedirect} />
          <Route path="/login" component={LoginPage} />
          <Route path="/admin/dashboard" component={AdminDashboard} />
          <Route path="/admin/categories" component={CategoriesPage} />
          <Route path="/admin/engineers" component={EngineersPage} />
          <Route path="/admin/projects" component={AdminProjectsPage} />
          <Route path="/engineer/profile" component={EngineerProfilePage} />
          <Route path="/engineer/projects" component={EngineerProjectsPage} />
          <Route path="/engineer/projects/:id" component={ProjectDetailPage} />
          <Route path="/engineer/contact-requests" component={ContactRequestsPage} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
