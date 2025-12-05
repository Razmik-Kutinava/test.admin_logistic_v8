import type { Component } from 'solid-js';
import { Router, Route } from '@solidjs/router';
import Navbar from './components/Navbar';
import ErrorBanner from './components/ErrorBanner';
import Dashboard from './pages/Dashboard';
import DriversPage from './pages/Drivers';
import OrdersPage from './pages/Orders';
import DeliveriesPage from './pages/Deliveries';
import DistrictsPage from './pages/Districts';
import WarehousesPage from './pages/Warehouses';

const App: Component = () => {
  return (
    <Router root={(props) => (
      <>
        <Navbar />
        <main class="min-h-screen bg-gray-50 py-8">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ErrorBanner />
            {props.children}
          </div>
        </main>
      </>
    )}>
      <Route path="/" component={Dashboard} />
      <Route path="/drivers" component={DriversPage} />
      <Route path="/orders" component={OrdersPage} />
      <Route path="/deliveries" component={DeliveriesPage} />
      <Route path="/districts" component={DistrictsPage} />
      <Route path="/warehouses" component={WarehousesPage} />
    </Router>
  );
};

export default App;
