import { FileText, Table2, Languages, Check } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useTranslation } from '../../i18n/LanguageContext.tsx';
import { languages } from '../../i18n/translations/index.ts';
import { Logo } from './Logo.tsx';

export type AppTab = 'documents' | 'spreadsheets';

interface SidebarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  modelLoaded: boolean;
  modelLoading: boolean;
  modelError: boolean;
}

export function Sidebar({ activeTab, onTabChange, modelLoaded, modelLoading, modelError }: SidebarProps) {
  const { t, language, setLanguage } = useTranslation();

  const navItems: Array<{ id: AppTab; label: string; icon: typeof FileText }> = [
    { id: 'spreadsheets', label: t.nav.spreadsheets, icon: Table2 },
    { id: 'documents', label: t.nav.documents, icon: FileText },
  ];

  const statusColor = modelError ? 'bg-destructive' : modelLoaded ? 'bg-accent' : modelLoading ? 'bg-warning animate-pulse' : 'bg-white/30';
  const statusLabel = modelError ? t.header.error : modelLoaded ? t.header.ready : t.header.notReady;

  return (
    <aside className="w-16 lg:w-60 shrink-0 bg-sidebar flex flex-col transition-all">
      {/* Brand */}
      <div className="flex items-center gap-3 px-3 lg:px-5 py-5">
        <div className="h-10 w-10 shrink-0 rounded-lg bg-white flex items-center justify-center shadow-sm">
          <Logo className="h-7 w-auto" />
        </div>
        <div className="hidden lg:flex flex-col min-w-0">
          <span className="font-display text-lg leading-6 tracking-tight text-white font-semibold truncate">Confidia</span>
          <span className="text-[9px] leading-tight text-white/50 tracking-[0.08em] uppercase break-words">{t.header.tagline}</span>
        </div>
      </div>

      <div className="mx-3 lg:mx-5 border-t border-white/10" />

      {/* Nav */}
      <nav className="flex-1 px-2 lg:px-3 py-4 space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              title={label}
              className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer ${
                active
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {active && <span className="absolute start-0 inset-y-2 w-1 rounded-full bg-accent" />}
              <Icon className="w-[18px] h-[18px] shrink-0" />
              <span className="hidden lg:inline truncate">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer: status + language */}
      <div className="px-2 lg:px-3 pb-4 space-y-2">
        <div className="mx-1 lg:mx-2 mb-2 border-t border-white/10" />
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/5" title={statusLabel}>
          <span className={`w-2 h-2 rounded-full shrink-0 ${statusColor}`} />
          <span className="hidden lg:inline text-xs text-white/70 truncate">{statusLabel}</span>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title={languages.find((l) => l.code === language)?.nativeName}
            >
              <Languages className="w-[18px] h-[18px] shrink-0" />
              <span className="hidden lg:inline text-xs truncate">
                {languages.find((l) => l.code === language)?.nativeName}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent side="top" align="start" className="w-48 p-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className="w-full text-start px-3 py-2 text-sm hover:bg-secondary transition-colors flex items-center justify-between cursor-pointer rounded-md"
              >
                <span className="text-foreground/80">{lang.nativeName}</span>
                {language === lang.code && <Check className="w-3.5 h-3.5 text-primary" />}
              </button>
            ))}
          </PopoverContent>
        </Popover>
      </div>
    </aside>
  );
}
