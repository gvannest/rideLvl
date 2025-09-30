import { cn } from "../../shared/utils/cn";

const Header = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'upload', label: 'Upload' },
    { id: 'library', label: 'Library' }
  ];

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 font-semibold text-lg text-gray-900">
          <span className="text-xl">⛰️</span>
          <span>RideLVL</span>
        </div>

        {/* Navigation */}
        <nav className="ml-auto flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "px-3 py-2 text-sm font-medium transition-colors hover:text-gray-900",
                activeTab === tab.id
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-600"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;