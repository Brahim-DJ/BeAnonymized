import { useState, useMemo } from 'react';
import { ENTITY_COLORS } from '../../core/types.ts';
import type { ReplacementEntry } from '../../core/types.ts';
import { EntityMark } from './EntityHighlight.tsx';
import { Button } from '@/components/ui/button';
import { Copy, Check, Shield } from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext.tsx';
import { useToast } from './Toast.tsx';

interface TextOutputProps {
  value: string;
  entries: ReplacementEntry[];
  loading?: boolean;
}

const CUSTOM_PLACEHOLDER_RE = /<<[^<>]+>>/g;

export function TextOutput({ value, entries, loading }: TextOutputProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const labelColorMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const entry of entries) {
      map.set(entry.replacement, ENTITY_COLORS[entry.entityType] ?? '#B6A596');
    }
    return map;
  }, [entries]);

  const handleCopy = async () => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    showToast(t.toast.copiedToClipboard);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderHighlighted = () => {
    if (!value) return null;
    const segments: Array<{ text: string; color?: string }> = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    CUSTOM_PLACEHOLDER_RE.lastIndex = 0;

    while ((match = CUSTOM_PLACEHOLDER_RE.exec(value)) !== null) {
      if (match.index > lastIndex) {
        segments.push({ text: value.slice(lastIndex, match.index) });
      }
      const color = labelColorMap.get(match[0]) ?? '#B6A596';
      segments.push({ text: match[0], color });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < value.length) {
      segments.push({ text: value.slice(lastIndex) });
    }

    return segments.map((seg, i) =>
      seg.color ? (
        <EntityMark key={i} color={seg.color} style={{ fontWeight: 500 }}>
          {seg.text}
        </EntityMark>
      ) : (
        <span key={i}>{seg.text}</span>
      )
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between h-12 relative border-b border-border px-4 bg-background/60">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-accent/25 flex items-center justify-center text-[11px] font-bold text-primary">2</span>
          <h3 className="font-display text-sm text-foreground font-semibold">
            {t.textOutput.title}
          </h3>
        </div>
        {value && (
          <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1.5 h-7 text-muted hover:bg-secondary hover:text-foreground">
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? t.textOutput.copied : t.textOutput.copy}
          </Button>
        )}
      </div>
      <div className="flex-1 min-h-[200px] p-4 text-foreground text-sm leading-relaxed whitespace-pre-wrap font-light">
        {loading ? (
          <div className="space-y-3">
            <div className="skeleton-line h-3 w-full rounded" />
            <div className="skeleton-line h-3 w-[90%] rounded" />
            <div className="skeleton-line h-3 w-[75%] rounded" />
            <div className="skeleton-line h-3 w-[85%] rounded" />
            <div className="skeleton-line h-3 w-[60%] rounded" />
          </div>
        ) : value ? (
          <>
            {renderHighlighted()}
            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-[10px] text-success/70 flex items-center gap-1.5">
                <Shield className="w-3 h-3" />
                {t.textOutput.nextStepHint}
              </p>
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full min-h-[160px] text-center px-4">
            <div className="w-10 h-10 bg-background border border-border flex items-center justify-center mb-4 rounded-md">
              <Shield className="w-5 h-5 text-muted" />
            </div>
            <p className="text-sm text-foreground font-medium mb-4 font-display">{t.textOutput.emptyStateHint}</p>
            <div className="space-y-2 text-left w-full max-w-[220px]">
              {[t.textOutput.emptyStateStep1, t.textOutput.emptyStateStep2, t.textOutput.emptyStateStep3].map((step, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="w-4 h-4 bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-[9px] font-bold mt-0.5 rounded-sm">{i + 1}</span>
                  <p className="text-xs text-muted leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted leading-relaxed mt-4 max-w-[240px] italic">{t.textOutput.emptyStateTip}</p>
          </div>
        )}
      </div>
      <div className="mt-auto border-t border-border px-4 py-2 bg-background">
        <p className="label-meta text-muted-foreground">&nbsp;</p>
      </div>
    </div>
  );
}
