import { Outlet } from 'react-router';
import AdminSidebar from '../components/admin/AdminSidebar';

// ---------------------------------------------------------------
// AdminLayout — sidebar + main content area for admin pages.
// Sidebar is fixed w-64 on desktop; main content is offset.
// ---------------------------------------------------------------

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <AdminSidebar />
      {/* Main content — offset by sidebar width on desktop */}
      <main className="lg:pl-64 min-h-screen">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
