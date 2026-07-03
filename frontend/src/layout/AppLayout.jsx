import DesktopNav from './DesktopNav';
import MobileNav from './MobileNav';

function AppLayout({ activeTab, setActiveTab, children }) {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-950">
      <DesktopNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 flex flex-col min-h-0 pt-20 md:pt-24 pb-24 md:pb-6 px-4 md:px-0">
        {children}
      </main>
    </div>
  );
}

export default AppLayout;
