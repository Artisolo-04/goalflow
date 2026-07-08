import { MAIN_TABS, TAGS_TAB } from './navConfig';

function DesktopNav({ activeTab, setActiveTab }) {
  const TagsIcon = TAGS_TAB.icon;
  const tagsActive = activeTab === TAGS_TAB.id;

  return (
    <div className="hidden md:flex fixed top-6 left-1/2 -translate-x-1/2 z-50 items-center gap-3">
      <nav className="flex bg-gray-900/90 backdrop-blur-lg border border-gray-800 rounded-2xl px-2 py-2 gap-1 shadow-xl shadow-black/30">
        {MAIN_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-150 ${
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

      <nav className="flex bg-gray-900/90 backdrop-blur-lg border border-gray-800 rounded-2xl px-2 py-2 shadow-xl shadow-black/30">
        <button
          onClick={() => setActiveTab(TAGS_TAB.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-150 ${
            tagsActive
              ? 'bg-indigo-500 text-white'
              : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
          }`}
        >
          <TagsIcon size={16} />
          Tags
        </button>
      </nav>
    </div>
  );
}
export default DesktopNav;
