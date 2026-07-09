import { Languages, Check } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useTranslation } from '../../i18n/LanguageContext.tsx';
import { languages } from '../../i18n/translations/index.ts';
import { Logo } from './Logo.tsx';

export function MobileTopBar() {
  const { language, setLanguage } = useTranslation();

  return (
    <header className="sm:hidden flex items-center justify-between gap-3 px-4 h-14 bg-sidebar shrink-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="h-8 w-8 shrink-0 rounded-md bg-white flex items-center justify-center shadow-sm">
          <Logo className="h-5 w-auto" />
        </div>
        <span className="font-display text-base tracking-tight text-white font-semibold truncate">Confidia</span>
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="flex items-center justify-center h-9 w-9 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title={languages.find((l) => l.code === language)?.nativeName}
          >
            <Languages className="w-[18px] h-[18px]" />
          </button>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="end" className="w-48 p-1">
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
    </header>
  );
}
