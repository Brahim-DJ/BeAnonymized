import { FileText, Table2 } from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext.tsx';
import type { AppTab } from './Sidebar.tsx';

interface MobileTabBarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

export function MobileTabBar({ activeTab, onTabChange }: MobileTabBarProps) {
  const { t } = useTranslation();

  const navItems: Array<{ id: AppTab; label: string; icon: typeof FileText }> = [
    { id: 'spreadsheets', label: t.nav.spreadsheets, icon: Table2 },
    { id: 'documents', label: t.nav.documents, icon: FileText },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-border grid grid-cols-2 shadow-[0_-2px_8px_rgba(33,63,122,0.08)]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {navItems.map(({ id, label, icon: Icon }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`relative flex flex-col items-center justify-center gap-1 py-2.5 cursor-pointer transition-colors ${
              active ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            {active && <span className="absolute top-0 inset-x-0 h-0.5 bg-accent" />}
            <Icon className="w-5 h-5" strokeWidth={active ? 2.4 : 2} />
            <span className={`text-[10px] ${active ? 'font-semibold' : 'font-medium'}`}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
