import { MAIN_TABS, TAGS_TAB } from './navConfig';

function MobileNav({ activeTab, setActiveTab }) {
  const TagsIcon = TAGS_TAB.icon;
  const tagsActive = activeTab === TAGS_TAB.id;

  return (
    <div
      className="flex md:hidden fixed bottom-3 left-3 right-3 z-50 items-stretch gap-2"
      style={{
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
      }}
    >
      <nav className="flex flex-1 bg-gray-900/95 backdrop-blur-lg border border-gray-800 rounded-2xl px-2 justify-between shadow-2xl shadow-black/40 py-2">
        {MAIN_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-1.5 min-h-[44px] rounded-xl transition-all duration-200 active:scale-90 ${
                active ? 'bg-indigo-500 text-white px-4' : 'text-gray-500 px-3'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              {active && <span className="text-[13px] font-medium whitespace-nowrap">{tab.label}</span>}
            </button>
          );
        })}
      </nav>

      <nav className="flex bg-gray-900/95 backdrop-blur-lg border border-gray-800 rounded-2xl px-2 justify-between shadow-2xl shadow-black/40 py-2">
        <button
          onClick={() => setActiveTab(TAGS_TAB.id)}
          className={`flex items-center justify-center gap-1.5 min-h-[44px] rounded-xl transition-all duration-200 active:scale-90 ${
            tagsActive ? 'bg-indigo-500 text-white px-4' : 'text-gray-500 px-3'
          }`}
        >
          <TagsIcon size={19} strokeWidth={tagsActive ? 2.5 : 2} />
          {tagsActive && <span className="text-[13px] font-medium whitespace-nowrap">Tags</span>}
        </button>
      </nav>
    </div>
  );
}
export default MobileNav;
