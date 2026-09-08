import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import PlaceholderPage from "./pages/PlaceholderPage";
import Dashboard from "./pages/Dashboard";
import Appliances from "./pages/Appliances";
import Inventory from "./pages/Inventory";
import Sales from "./pages/Sales";
import Customers from "./pages/Customers";
import Credits from "./pages/Credits";
import Payments from "./pages/Payments";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route
            path="/"
            element={<Dashboard />}
          />
          <Route
            path="/sales"
            element={
              <Sales />
            }
          />
          <Route
            path="/customers"
            element={
              <Customers />
            }
          />
          <Route
            path="/credits"
            element={
              <Credits />
            }
          />
          <Route
            path="/payments"
           /* element={
              <Payments />
            } */
          />
          <Route
            path="/appliances"
            element={<Appliances />
            }
          />
          <Route
            path="/inventory"
            element={
              <Inventory />
            }
          />
          <Route
            path="/notifications"
            element={
              <Notifications  />
            }
          />
          <Route
            path="/settings"
            element={
              <Settings />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
export default App;
