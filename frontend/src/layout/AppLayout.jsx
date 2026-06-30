import DesktopNav from './DesktopNav';
import MobileNav from './MobileNav';

function AppLayout({ activeTab, setActiveTab, children }) {
  return (
    <div className="min-h-screen bg-gray-950 pb-28 md:pb-6">
      <DesktopNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="pt-6 md:pt-28 px-4 md:px-0">{children}</main>
    </div>
  );
}

export default AppLayout;
