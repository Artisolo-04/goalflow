import { TABS } from './navConfig';

function MobileNav({ activeTab, setActiveTab }) {
  return (
    <nav
      className="flex md:hidden fixed bottom-3 left-3 right-3 z-50 bg-gray-900/95 backdrop-blur-lg border border-gray-800 rounded-3xl px-2 justify-around shadow-2xl shadow-black/40"
      style={{
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
        paddingTop: '0.5rem',
      }}
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[44px] rounded-2xl transition-all duration-150 active:scale-90 ${
              active ? 'bg-indigo-500 text-white' : 'text-gray-500'
            }`}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default MobileNav;
