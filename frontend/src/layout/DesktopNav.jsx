import { TABS } from './navConfig';

function DesktopNav({ activeTab, setActiveTab }) {
  return (
    <nav className="hidden md:flex fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900/90 backdrop-blur-lg border border-gray-800 rounded-full px-2 py-2 gap-1 shadow-xl shadow-black/30">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-150 ${
              active
                ? 'bg-indigo-500 text-white'
                : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
            }`}
          >
            <Icon size={16} />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

export default DesktopNav;
