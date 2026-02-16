import { Outlet } from 'react-router';
import PublicHeader from '../components/PublicHeader';
import Footer from '../sections/Footer';

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-[#050505]">
      <PublicHeader />
      {/* Main content with padding-top to account for fixed header */}
      <main className="pt-[72px]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
