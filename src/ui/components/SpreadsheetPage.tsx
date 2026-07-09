import { useRef, useState } from 'react';
import { AnonymizationSession } from '../../core/session.ts';
import { AnonymizeView } from './AnonymizeView.tsx';
import { RestoreView } from './RestoreView.tsx';
import { useTranslation } from '../../i18n/LanguageContext.tsx';
import { PageHeader } from './PageHeader.tsx';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function SpreadsheetPage() {
  const { t } = useTranslation();
  const sessionRef = useRef(new AnonymizationSession());
  const [mode, setMode] = useState<'anonymize' | 'restore'>('anonymize');

  return (
    <div className="h-full flex flex-col min-h-0">
      <PageHeader
        title={t.nav.spreadsheets}
        description={t.spreadsheet.uploadSubtitle}
        actions={
          <Tabs value={mode} onValueChange={(value) => setMode(value as 'anonymize' | 'restore')}>
            <TabsList variant="pill">
              <TabsTrigger value="anonymize" variant="pill">{t.spreadsheet.anonymizeTab}</TabsTrigger>
              <TabsTrigger value="restore" variant="pill">{t.spreadsheet.restoreTab}</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      <Card className="flex-1 min-h-0 overflow-hidden p-0 flex flex-col">
        <div className={`h-full min-h-0 ${mode === 'anonymize' ? '' : 'hidden'}`}>
          <AnonymizeView sessionRef={sessionRef} />
        </div>
        <div className={`h-full min-h-0 ${mode === 'restore' ? '' : 'hidden'}`}>
          <RestoreView sessionRef={sessionRef} />
        </div>
      </Card>
    </div>
  );
}
