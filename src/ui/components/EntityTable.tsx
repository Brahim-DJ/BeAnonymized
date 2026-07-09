import { useState, useCallback, useEffect, useRef } from 'react';
import type { DetectedEntity, ReplacementEntry } from '../../core/types.ts';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { EntityBadge } from './EntityHighlight.tsx';
import { ConfidenceBar } from './ConfidenceBar.tsx';
import { useTranslation } from '../../i18n/LanguageContext.tsx';

interface EntityTableProps {
  entities: DetectedEntity[];
  entries: ReplacementEntry[];
  excludedIndices: Set<number>;
  onToggle: (index: number) => void;
  onRenameLabel: (original: string, newLabel: string) => void;
}

export function EntityTable({ entities, entries, excludedIndices, onToggle, onRenameLabel }: EntityTableProps) {
  const { t } = useTranslation();
  const [editingOriginal, setEditingOriginal] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [expanded, setExpanded] = useState(false);
  const prevEntityCount = useRef(0);

  useEffect(() => {
    if (entities.length > 0 && prevEntityCount.current === 0) {
      setExpanded(true);
    }
    if (entities.length === 0) {
      prevEntityCount.current = 0;
    } else {
      prevEntityCount.current = entities.length;
    }
  }, [entities.length]);

  const startEditing = useCallback((original: string, currentLabel: string) => {
    setEditingOriginal(original);
    const inner = currentLabel.startsWith('<<') && currentLabel.endsWith('>>')
      ? currentLabel.slice(2, -2)
      : currentLabel;
    setEditValue(inner);
  }, []);

  const commitEdit = useCallback(() => {
    if (editingOriginal && editValue.trim()) {
      onRenameLabel(editingOriginal, `<<${editValue.trim()}>>`);
    }
    setEditingOriginal(null);
  }, [editingOriginal, editValue, onRenameLabel]);

  const renderLabel = (entity: DetectedEntity) => {
    const entry = entries.find(e => e.original === entity.value);
    const label = entry?.replacement ?? '\u2014';
    if (!entry) return label;
    if (editingOriginal === entity.value) {
      return (
        <span className="inline-flex items-center gap-0">
          <span className="text-muted-foreground/50">&lt;&lt;</span>
          <input
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitEdit();
              if (e.key === 'Escape') setEditingOriginal(null);
            }}
            className="bg-secondary border border-primary px-1.5 py-0.5 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary rounded-sm"
            style={{ width: `${Math.max(editValue.length + 1, 5)}ch` }}
          />
          <span className="text-muted-foreground/50">&gt;&gt;</span>
        </span>
      );
    }
    return (
      <span
        onClick={() => startEditing(entity.value, label)}
        className="cursor-pointer hover:text-destructive transition-colors"
        title={t.entityTable.clickToRename}
      >
        {label}
      </span>
    );
  };

  if (entities.length === 0) return null;

  return (
    <Accordion
      type="single"
      collapsible
      value={expanded ? 'entities' : ''}
      onValueChange={(value) => setExpanded(value === 'entities')}
      className="mb-5"
    >
      <AccordionItem value="entities">
        <AccordionTrigger>
          <h3 className="text-sm font-semibold text-foreground">
            {t.entityTable.title(entities.length)}
          </h3>
        </AccordionTrigger>
        <AccordionContent>
      <Card className="overflow-hidden border-t-0 mt-0 rounded-b-xl rounded-t-none shadow-none">
        <div className="px-4 py-2.5 bg-secondary/20 border-b border-border">
          <p className="text-[11px] text-muted-foreground leading-relaxed">{t.entityTable.subtitle}</p>
        </div>
        {/* Desktop table */}
        <table className="w-full text-sm hidden md:table">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-start p-3 label-meta text-muted-foreground">{t.entityTable.type}</th>
              <th className="text-start p-3 label-meta text-muted-foreground">{t.entityTable.label}</th>
              <th className="text-start p-3 label-meta text-muted-foreground">{t.entityTable.originalValue}</th>
              <th className="text-start p-3 label-meta text-muted-foreground">{t.entityTable.confidence}</th>
              <th className="text-center p-3 label-meta text-muted-foreground">{t.entityTable.include}</th>
            </tr>
          </thead>
          <tbody>
            {entities.map((entity, index) => {
              const excluded = excludedIndices.has(index);
              return (
                <tr
                  key={`${entity.start}-${entity.value}`}
                  className={`border-b border-border last:border-0 hover:bg-secondary/20 transition-colors ${
                    excluded ? 'opacity-40' : ''
                  }`}
                >
                  <td className="p-3">
                    <EntityBadge type={entity.type} label={t.entityLabels[entity.type]} />
                  </td>
                  <td className="p-3 text-muted-foreground text-xs font-mono">
                    {renderLabel(entity)}
                  </td>
                  <td className="p-3 text-foreground font-mono text-xs">{entity.value}</td>
                  <td className="p-3">
                    <ConfidenceBar confidence={entity.confidence} size="sm" />
                  </td>
                  <td className="p-3 text-center">
                    <Checkbox
                      checked={!excluded}
                      onCheckedChange={() => onToggle(index)}
                      aria-label={excluded ? t.entityTable.includeEntity : t.entityTable.excludeEntity}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Mobile card layout */}
        <div className="md:hidden divide-y divide-border">
          {entities.map((entity, index) => {
            const excluded = excludedIndices.has(index);
            return (
              <div
                key={`m-${entity.start}-${entity.value}`}
                className={`p-3 space-y-2 ${excluded ? 'opacity-40' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <EntityBadge type={entity.type} label={t.entityLabels[entity.type]} />
                  <Checkbox
                    checked={!excluded}
                    onCheckedChange={() => onToggle(index)}
                    aria-label={excluded ? t.entityTable.includeEntity : t.entityTable.excludeEntity}
                  />
                </div>
                <div className="text-xs font-mono text-foreground truncate">{entity.value}</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground">{renderLabel(entity)}</span>
                  <ConfidenceBar confidence={entity.confidence} size="xs" />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
