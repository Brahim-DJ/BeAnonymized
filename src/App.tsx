import { useState, useEffect, useCallback, useRef } from 'react';
import { SpreadsheetPage } from './ui/components/SpreadsheetPage.tsx';
import { DocumentPage } from './ui/components/DocumentPage.tsx';
import { useAnonymizer } from './ui/hooks/useAnonymizer.ts';
import { useTranslation } from './i18n/LanguageContext.tsx';
import { useToast } from './ui/components/Toast.tsx';
import { Sidebar, type AppTab } from './ui/components/Sidebar.tsx';
import { MobileTopBar } from './ui/components/MobileTopBar.tsx';
import { MobileTabBar } from './ui/components/MobileTabBar.tsx';

export default function App() {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const {
    inputText, anonymizedText, entities, entries, excludedIndices,
    modelLoaded, modelLoading, modelError,
    anonymizing, detectionProgress, detectionError, downloadProgress,
    threshold, replacementMode, customLabels,
    docxFileName, hasDocxExtraction,
    activeProvider, regexRules, regexRegion,
    handleInputChange, anonymize,
    addManualEntity, removeEntity, renameLabel, toggleEntity,
    deanonymize, clear,
    handleThresholdChange, handleReplacementModeChange, handleCustomLabelsChange,
    handleSwitchProvider, handleRegexChange, handleRegexRegionChange,
    loadDocxFile, exportDocx, removeDocxFile,
  } = useAnonymizer();

  const [activeTab, setActiveTab] = useState<AppTab>('spreadsheets');
  const [downloading, setDownloading] = useState(false);
  const clearSnapshotRef = useRef<{ text: string; anonymized: string; entities: typeof entities; entries: typeof entries } | null>(null);

  const handleDownloadDocx = useCallback(async () => {
    if (!exportDocx) return;
    setDownloading(true);
    try {
      const blob = await exportDocx();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ext = docxFileName?.match(/\.(docx?)$/i)?.[1] ?? 'docx';
      const baseName = docxFileName?.replace(/\.(docx?)$/i, '') ?? 'document';
      a.href = url;
      a.download = `${baseName}_redacted.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(t.textOutput.downloaded);
    } catch (err) {
      console.error('[Confidia] Export failed:', err);
      showToast(t.textOutput.exportFailed ?? 'Export failed.');
    } finally {
      setDownloading(false);
    }
  }, [exportDocx, docxFileName, showToast, t]);

  // Keyboard shortcut: Cmd+Enter / Ctrl+Enter to redact
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (inputText.trim() && !anonymizing) {
          anonymize();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [inputText, anonymizing, anonymize]);

  // Clear with undo
  const handleClear = useCallback(() => {
    if (!inputText) return;
    clearSnapshotRef.current = { text: inputText, anonymized: anonymizedText, entities, entries };
    clear();
    showToast(t.toast.cleared, {
      label: t.toast.undo,
      onClick: () => {
        const snap = clearSnapshotRef.current;
        if (snap) {
          handleInputChange(snap.text);
          clearSnapshotRef.current = null;
        }
      },
    });
  }, [inputText, anonymizedText, entities, entries, clear, handleInputChange, showToast, t]);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Mobile top bar (branding + language) */}
      <MobileTopBar />

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* App sidebar (sm and up) */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          modelLoaded={modelLoaded}
          modelLoading={modelLoading}
          modelError={Boolean(modelError)}
        />

        {/* Content column */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className={`flex-1 min-h-0 flex flex-col max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-20 sm:pb-4 ${activeTab === 'spreadsheets' ? '' : 'hidden'}`}>
            <SpreadsheetPage />
          </div>
          <div className={`flex-1 min-h-0 flex flex-col max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-20 sm:pb-4 ${activeTab === 'documents' ? '' : 'hidden'}`}>
          <DocumentPage
            inputText={inputText}
            anonymizedText={anonymizedText}
            entities={entities}
            entries={entries}
            excludedIndices={excludedIndices}
            modelLoaded={modelLoaded}
            modelLoading={modelLoading}
            modelError={modelError}
            anonymizing={anonymizing}
            detectionProgress={detectionProgress}
            detectionError={detectionError}
            downloadProgress={downloadProgress}
            threshold={threshold}
            replacementMode={replacementMode}
            customLabels={customLabels}
            docxFileName={docxFileName}
            hasDocxExtraction={hasDocxExtraction}
            activeProvider={activeProvider}
            regexRules={regexRules}
            regexRegion={regexRegion}
            handleInputChange={handleInputChange}
            anonymize={anonymize}
            addManualEntity={addManualEntity}
            removeEntity={removeEntity}
            renameLabel={renameLabel}
            toggleEntity={toggleEntity}
            deanonymize={deanonymize}
            clear={clear}
            handleThresholdChange={handleThresholdChange}
            handleReplacementModeChange={handleReplacementModeChange}
            handleCustomLabelsChange={handleCustomLabelsChange}
            handleSwitchProvider={handleSwitchProvider}
            handleRegexChange={handleRegexChange}
            handleRegexRegionChange={handleRegexRegionChange}
            loadDocxFile={loadDocxFile}
            exportDocx={exportDocx}
            removeDocxFile={removeDocxFile}
            handleClear={handleClear}
            handleDownloadDocx={handleDownloadDocx}
            downloading={downloading}
          />
        </div>
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <MobileTabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
