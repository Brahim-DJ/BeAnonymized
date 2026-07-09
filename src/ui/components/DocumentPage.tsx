import { useState } from 'react';
import type { DetectedEntity, EntityType, ReplacementEntry } from '../../core/types.ts';
import type { RegexRegionId, ProviderId } from '../../core/engine.ts';
import type { ReplacementMode } from '../../core/session.ts';
import { TextInput } from './TextInput.tsx';
import { TextOutput } from './TextOutput.tsx';
import { EntityTable } from './EntityTable.tsx';
import { DeAnonymize } from './DeAnonymize.tsx';
import { PageHeader } from './PageHeader.tsx';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { ArrowRight, Settings, Plus, X, FileText, Download, Sparkles } from 'lucide-react';
import { PROVIDERS, REGEX_REGIONS } from '../../core/engine.ts';
import { useTranslation } from '../../i18n/LanguageContext.tsx';
import { Logo } from './Logo.tsx';

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface Props {
  inputText: string;
  anonymizedText: string;
  entities: DetectedEntity[];
  entries: ReplacementEntry[];
  excludedIndices: Set<number>;
  modelLoaded: boolean;
  modelLoading: boolean;
  modelError: boolean;
  anonymizing: boolean;
  detectionProgress: number | null;
  detectionError: string | null;
  downloadProgress: { downloaded: number; total: number } | null;
  threshold: number;
  replacementMode: ReplacementMode;
  customLabels: string[];
  docxFileName: string | null;
  hasDocxExtraction: boolean;
  activeProvider: ProviderId;
  regexRules: boolean;
  regexRegion: RegexRegionId;
  handleInputChange: (text: string) => void;
  anonymize: () => void;
  addManualEntity: (start: number, end: number, type: EntityType) => void;
  removeEntity: (index: number) => void;
  renameLabel: (original: string, newLabel: string) => void;
  toggleEntity: (index: number) => void;
  deanonymize: (text: string) => string;
  clear: () => void;
  handleThresholdChange: (value: number) => void;
  handleReplacementModeChange: (mode: ReplacementMode) => void;
  handleCustomLabelsChange: (labels: string[]) => void;
  handleSwitchProvider: (id: ProviderId) => void;
  handleRegexChange: (enabled: boolean) => void;
  handleRegexRegionChange: (region: RegexRegionId) => void;
  loadDocxFile: (file: File) => Promise<{ success: boolean; error?: string }>;
  exportDocx: () => Promise<Blob>;
  removeDocxFile: () => void;
  handleClear: () => void;
  handleDownloadDocx: () => void;
  downloading: boolean;
}

export function DocumentPage(props: Props) {
  const { t, language } = useTranslation();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newLabelInput, setNewLabelInput] = useState('');
  const [labelsExpanded, setLabelsExpanded] = useState(false);

  const handleAddLabel = () => {
    const label = newLabelInput.trim().toLowerCase();
    if (!label || props.customLabels.includes(label)) return;
    props.handleCustomLabelsChange([...props.customLabels, label]);
    setNewLabelInput('');
  };

  const handleRemoveLabel = (label: string) => {
    props.handleCustomLabelsChange(props.customLabels.filter((l) => l !== label));
  };

  const progressPercent = props.downloadProgress
    ? (props.downloadProgress.total > 0 ? Math.min(100, Math.round((props.downloadProgress.downloaded / props.downloadProgress.total) * 100)) : 0)
    : 0;

  const steps = [
    { label: t.howItWorks.step1Label, text: t.howItWorks.step1Text },
    { label: t.howItWorks.step2Label, text: t.howItWorks.step2Text },
    { label: t.howItWorks.step3Label, text: t.howItWorks.step3Text },
  ];

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Model download overlay */}
      {props.modelLoading && (
        <div className="fixed inset-0 z-40 bg-background/95 flex items-center justify-center">
          <Card className="max-w-sm w-full mx-6 border-primary/20 shadow-lg">
            <CardContent className="pt-8 pb-8 text-center">
              <Logo className="h-10 w-auto mx-auto mb-3" />
              <h2 className="font-display text-xl tracking-tight text-primary font-semibold mb-4">Confidia</h2>
              <p className="text-sm text-muted mb-6 font-body">{t.loading.preparingEngine}</p>
              <Progress value={progressPercent} className="mb-3" />
              {props.downloadProgress ? (
                <p className="label-meta text-muted">
                  {props.downloadProgress.total > 0
                    ? t.loading.progress(formatBytes(props.downloadProgress.downloaded), formatBytes(props.downloadProgress.total), progressPercent)
                    : formatBytes(props.downloadProgress.downloaded)}
                </p>
              ) : (
                <p className="label-meta text-muted">{t.loading.initializing}</p>
              )}
              <p className="label-meta text-muted mt-4">
                {props.downloadProgress && props.downloadProgress.total > 0
                  ? t.loading.oneTimeSetupWithSize(formatBytes(props.downloadProgress.total))
                  : t.loading.oneTimeSetup}
              </p>
              {props.downloadProgress && props.downloadProgress.total > 100 * 1024 * 1024 && (
                <p className="text-xs text-destructive mt-2 font-medium">{t.loading.largeModelWarning}</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Anonymizing overlay */}
      {props.anonymizing && (
        <div className="fixed inset-0 z-40 bg-background/80 flex items-center justify-center">
          <Card className="border-primary/20 shadow-lg">
            <CardContent className="pt-8 pb-8 px-10 text-center">
              <div className="flex justify-center gap-[6px] mb-6">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-2 h-8 bg-primary/20 rounded-full" style={{ animation: 'redact-bar 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite', animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <p className="font-display text-base font-bold mb-1 uppercase tracking-tight">{t.anonymizing.title}</p>
              {props.detectionProgress !== null && (
                <div className="w-48 mx-auto mt-3 mb-2">
                  <Progress value={Math.round(props.detectionProgress * 100)} className="h-1.5" />
                  <p className="text-[10px] text-muted-foreground mt-1">{Math.round(props.detectionProgress * 100)}%</p>
                </div>
              )}
              <p className="text-sm text-muted font-body">{t.anonymizing.description}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Page header */}
      <PageHeader
        title={t.nav.documents}
        description={t.step1.description}
        actions={
          <>
            <Badge variant={props.modelLoaded ? 'success' : props.modelError ? 'destructive' : 'warning'}>
              <span className={`w-1.5 h-1.5 rounded-full ${props.modelLoaded ? 'bg-success' : props.modelError ? 'bg-destructive' : 'bg-warning animate-pulse'}`} />
              {props.modelLoaded ? t.header.ready : props.modelError ? t.header.error : t.header.notReady}
            </Badge>
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t.settings.detectionModel}</DialogTitle>
                </DialogHeader>
                <div className="space-y-5">
                  <div className="space-y-2">
                    {PROVIDERS.map((p) => {
                      const modelT = t.settings.models[p.id as keyof typeof t.settings.models];
                      return (
                        <button
                          key={p.id}
                          onClick={() => { setSettingsOpen(false); props.handleSwitchProvider(p.id); }}
                          disabled={props.modelLoading}
                          className={`w-full text-start px-4 py-3 border rounded-lg transition-colors cursor-pointer ${
                            props.activeProvider === p.id
                              ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary/20'
                              : 'border-border text-muted hover:border-primary/40'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <p className="text-sm font-medium">{modelT?.label ?? p.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{modelT?.description ?? p.description}</p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="label-meta text-muted-foreground">{t.settings.detectionSensitivity}</span>
                      <span className="label-meta text-foreground">{Math.round((1 - props.threshold) * 100)}%</span>
                    </div>
                    <Slider
                      min={5} max={95} step={1}
                      value={[Math.round((1 - props.threshold) * 100)]}
                      onValueChange={([v]) => props.handleThresholdChange(1 - v / 100)}
                    />
                    <div className="flex justify-between mt-1.5">
                      <span className="label-meta text-muted-foreground">{t.settings.fewerMatches}</span>
                      <span className="label-meta text-muted-foreground">{t.settings.moreMatches}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-3">{t.settings.sensitivityExplanation}</p>
                  </div>

                  <div className="border-t border-border pt-4">
                    <label className="flex items-center justify-between cursor-pointer gap-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">{t.settings.regexRules}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{t.settings.regexRulesDescription}</p>
                      </div>
                      <Switch checked={props.regexRules} onCheckedChange={props.handleRegexChange} />
                    </label>
                    {props.regexRules && (
                      <div className="mt-3">
                        <span className="label-meta text-muted-foreground">{t.settings.regexRegion}</span>
                        <Select
                          value={props.regexRegion}
                          onChange={(e) => props.handleRegexRegionChange(e.target.value as RegexRegionId)}
                          className="mt-1.5 h-9 text-xs"
                        >
                          {REGEX_REGIONS.map((r) => (
                            <option key={r} value={r}>{t.settings.regexRegions[r] ?? r}</option>
                          ))}
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border pt-4">
                    <span className="label-meta text-muted-foreground">{t.settings.replacementStyle}</span>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(['labeled', 'blanked'] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => props.handleReplacementModeChange(mode)}
                          className={`text-start px-4 py-3 border rounded-lg transition-colors cursor-pointer ${
                            props.replacementMode === mode
                              ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary/20'
                              : 'border-border text-muted hover:border-primary/40'
                          }`}
                        >
                          <p className="text-sm font-medium">{mode === 'labeled' ? t.settings.labeledPlaceholders : t.settings.blankedOut}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{mode === 'labeled' ? t.settings.labeledDescription : t.settings.blankedDescription}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      {/* Scrollable content */}
      <div className="flex-1 min-h-0 overflow-auto -mx-2 px-2 pb-4">
        {/* Step strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-3 bg-white border border-border rounded-xl px-4 py-3 shadow-xs">
              <span className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                i === 0 ? 'bg-accent text-primary' : 'bg-primary/10 text-primary'
              }`}>
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{step.label}</p>
                <p className="text-[11px] text-muted-foreground truncate">{step.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Custom labels */}
        {props.activeProvider !== 'bardsai' && (
          <Accordion
            type="single"
            collapsible
            value={labelsExpanded ? 'labels' : ''}
            onValueChange={(value) => setLabelsExpanded(value === 'labels')}
            className="mb-5"
          >
            <AccordionItem value="labels">
              <AccordionTrigger>
                <div className="flex items-baseline gap-2 min-w-0">
                  <Sparkles className="w-4 h-4 shrink-0 self-center text-accent" />
                  <span className="text-sm font-semibold">{t.settings.customLabels}</span>
                  {!labelsExpanded && props.customLabels.length > 0 && (
                    <span className="text-[11px] text-muted-foreground font-mono truncate">{props.customLabels.join(', ')}</span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="border border-t-0 border-border rounded-b-xl bg-white p-4">
                  <p className="text-xs text-muted-foreground mb-3">{t.settings.customLabelsDescription}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Input
                      type="text"
                      value={newLabelInput}
                      onChange={(e) => setNewLabelInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddLabel(); }}
                      placeholder={t.settings.customLabelsPlaceholder}
                      className="w-56 h-9 text-xs font-mono"
                    />
                    <Button size="sm" onClick={handleAddLabel} disabled={!newLabelInput.trim()}>
                      <Plus className="w-3 h-3" /> {t.settings.addLabel}
                    </Button>
                    {props.customLabels.map((label) => (
                      <span key={label} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-primary/10 text-primary font-mono rounded-full">
                        {label}
                        <button onClick={() => handleRemoveLabel(label)} className="text-primary/50 hover:text-destructive transition-colors cursor-pointer" aria-label={`Remove ${label}`}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {/* File bar */}
        {props.docxFileName && props.anonymizedText && (
          <div className="flex items-center justify-between gap-3 bg-white border border-border rounded-xl px-4 py-2.5 mb-4 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 bg-primary/5 border border-primary/15 flex items-center justify-center flex-shrink-0 rounded-lg">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <p className="text-xs text-foreground truncate font-medium">{props.docxFileName}</p>
            </div>
            {props.hasDocxExtraction && props.entries.length > 0 && (
              <Button variant="outline" size="sm" onClick={props.handleDownloadDocx} disabled={props.downloading}>
                <Download className="w-3 h-3" /> {t.textOutput.downloadDocx}
              </Button>
            )}
          </div>
        )}

        {/* Editor: two cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="flex flex-col overflow-hidden p-0">
            <TextInput
              value={props.inputText}
              onChange={props.handleInputChange}
              onClear={props.handleClear}
              entities={props.entities}
              onAddEntity={props.addManualEntity}
              onRemoveEntity={props.removeEntity}
              docxFileName={props.docxFileName}
              onLoadDocx={props.loadDocxFile}
              onRemoveDocx={props.removeDocxFile}
            />
          </Card>
          <Card className="flex flex-col overflow-hidden p-0">
            <TextOutput value={props.anonymizedText} entries={props.entries} loading={props.anonymizing} />
          </Card>
        </div>

        {/* Redact CTA */}
        <div className="sticky bottom-0 z-30 bg-background/95 backdrop-blur-sm py-4 -mx-2 px-2 mt-1">
          <div className="flex flex-col items-center gap-2">
            <Button
              onClick={props.anonymize}
              disabled={!props.inputText.trim() || props.anonymizing}
              variant="accent"
              size="lg"
              className="gap-2 px-12 uppercase tracking-[0.12em] text-sm"
            >
              {props.anonymizing ? t.redactButton.redacting : <>{t.redactButton.redact} <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} /></>}
            </Button>
            <p className="label-meta text-muted-foreground/60">{t.redactButton.shortcutHint}</p>
            {props.detectionError && (
              <div className="max-w-lg w-full border border-destructive bg-destructive/5 p-4 text-center rounded-xl">
                <p className="text-sm font-sans font-semibold text-destructive uppercase tracking-wider">Detection failed</p>
                <p className="text-xs text-muted mt-1.5">The model could not process this text. Please try again or refresh the page.</p>
              </div>
            )}
          </div>
        </div>

        {/* Entity table */}
        {props.replacementMode === 'labeled' && (
          <EntityTable
            entities={props.entities}
            entries={props.entries}
            excludedIndices={props.excludedIndices}
            onToggle={props.toggleEntity}
            onRenameLabel={props.renameLabel}
          />
        )}

        {/* De-anonymize */}
        {props.replacementMode === 'labeled' && props.entries.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</span>
              <div>
                <h2 className="font-display text-lg font-bold text-foreground tracking-tight leading-tight">{t.step2.title}</h2>
                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{t.step2.description}</p>
              </div>
            </div>
            <DeAnonymize onDeanonymize={props.deanonymize} hasMapping={props.entries.length > 0} />
          </div>
        )}
      </div>
    </div>
  );
}
