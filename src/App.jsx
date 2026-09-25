import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import { useEffect } from "react";
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import Receipt from './pages/Receipt';
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
  // ── Global draggable modals ──────────────────────────────────────────────
  // Listens for pointer events on any .modal-header and makes its parent
  // box freely draggable. Works for mouse and touch (all-in-one screens).
  useEffect(() => {
    let dragging = false;
    let modalBox = null;
    let startX = 0, startY = 0, startLeft = 0, startTop = 0;

    const modalPositions = new Map();

    function getModalKey(modal) {
      const h2 = modal.querySelector('.modal-header h2');
      return h2 ? h2.textContent.trim() : 'default';
    }

    const observer = new MutationObserver((mutations) => {
      for (const mut of mutations) {
        for (const node of mut.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const modals = node.classList?.contains('app-modal') ? [node] : (node.querySelectorAll ? node.querySelectorAll('.app-modal') : []);
            for (const modal of modals) {
              const key = getModalKey(modal);
              const pos = modalPositions.get(key);
              if (pos) {
                modal.style.position = 'fixed';
                modal.style.margin = '0';
                modal.style.left = pos.left;
                modal.style.top = pos.top;
              }
            }
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    function onPointerDown(e) {
      const header = e.target.closest('.modal-header');
      if (!header) return;
      // Don't start a drag when the user taps the close button
      if (e.target.closest('button')) return;

      modalBox = header.parentElement;
      if (!modalBox) return;

      const rect = modalBox.getBoundingClientRect();
      // Snap out of flexbox centering so we can position freely
      modalBox.style.position = 'fixed';
      modalBox.style.margin   = '0';
      modalBox.style.left     = rect.left + 'px';
      modalBox.style.top      = rect.top  + 'px';

      startX    = e.clientX;
      startY    = e.clientY;
      startLeft = rect.left;
      startTop  = rect.top;
      dragging  = true;

      header.style.cursor = 'grabbing';
      e.preventDefault(); // prevent scroll / text-select during drag
    }

    function onPointerMove(e) {
      if (!dragging || !modalBox) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      // Clamp so the modal box can't leave the viewport
      const maxLeft = window.innerWidth  - modalBox.offsetWidth;
      const maxTop  = window.innerHeight - modalBox.offsetHeight;
      modalBox.style.left = Math.max(0, Math.min(startLeft + dx, maxLeft)) + 'px';
      modalBox.style.top  = Math.max(0, Math.min(startTop  + dy, maxTop))  + 'px';
    }

    function onPointerUp() {
      if (!dragging) return;
      dragging = false;
      if (modalBox) {
        const header = modalBox.querySelector('.modal-header');
        if (header) header.style.cursor = '';
        
        const key = getModalKey(modalBox);
        modalPositions.set(key, {
          left: modalBox.style.left,
          top: modalBox.style.top
        });
      }
      modalBox = null;
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup',   onPointerUp);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup',   onPointerUp);
      observer.disconnect();
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/receipt/:type/:id" element={<PrivateRoute><Receipt /></PrivateRoute>} />
        <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
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
