import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RotateCcw, Copy, Check, ClipboardPaste, FileCheck2 } from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext.tsx';
import { useToast } from './Toast.tsx';

interface DeAnonymizeProps {
  onDeanonymize: (text: string) => string;
  hasMapping: boolean;
}

export function DeAnonymize({ onDeanonymize, hasMapping }: DeAnonymizeProps) {
  const { t } = useTranslation();
  const [aiResponse, setAiResponse] = useState('');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  const { showToast } = useToast();

  if (!hasMapping) return null;

  const handleDeanonymize = () => {
    if (!aiResponse.trim()) return;
    setResult(onDeanonymize(aiResponse));
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    showToast(t.toast.copiedToClipboard);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="flex flex-col overflow-hidden p-0">
        <div className="flex items-center gap-2 h-11 px-4 border-b border-border bg-background/60">
          <ClipboardPaste className="w-4 h-4 text-primary shrink-0" />
          <label className="text-xs font-semibold text-foreground">{t.deAnonymize.pasteLabel}</label>
        </div>
        <div className="min-h-[200px]">
          <textarea
            value={aiResponse}
            onChange={(e) => setAiResponse(e.target.value)}
            placeholder={t.deAnonymize.inputPlaceholder}
            className="w-full bg-transparent p-4 text-foreground placeholder-muted-foreground resize-none focus:outline-none text-sm leading-relaxed min-h-[200px]"
            style={{ fieldSizing: 'content' } as React.CSSProperties}
          />
        </div>
        <div className="mt-auto border-t border-border px-4 py-2.5 bg-background/60">
          <Button
            onClick={handleDeanonymize}
            disabled={!aiResponse.trim()}
            variant="accent"
            size="sm"
            className="gap-2 uppercase tracking-wider"
          >
            <RotateCcw className="w-3 h-3" />
            {t.deAnonymize.restoreButton}
          </Button>
        </div>
      </Card>
      <Card className="flex flex-col overflow-hidden p-0">
        <div className="flex items-center gap-2 h-11 px-4 border-b border-border bg-background/60">
          <FileCheck2 className="w-4 h-4 text-primary shrink-0" />
          <label className="text-xs font-semibold text-foreground flex-1">{t.deAnonymize.restoredLabel}</label>
          {result && (
            <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1.5 h-7">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? t.deAnonymize.copied : t.deAnonymize.copy}
            </Button>
          )}
        </div>
        <div className="flex-1 min-h-[200px] p-4 text-foreground text-sm leading-relaxed whitespace-pre-wrap">
          {result || (
            <span className="text-muted-foreground">
              {t.deAnonymize.outputPlaceholder}
            </span>
          )}
        </div>
      </Card>
    </div>
  );
}
