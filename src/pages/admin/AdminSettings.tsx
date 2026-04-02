import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, ChevronDown, Check, Shield, Bell, MessageSquare, Building } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { cn } from '../../lib/utils';
import { store } from '../../services/store';
import type { PlatformSettings } from '../../types/database';

type SectionId = 'platform' | 'whatsapp' | 'notifications' | 'security';

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full py-3 group"
    >
      <span className="text-sm text-graphite">{label}</span>
      <div
        className={cn(
          'relative w-11 h-6 sharp-edge transition-colors',
          checked ? 'bg-warm' : 'bg-silver/30'
        )}
      >
        <motion.div
          className="absolute top-0.5 w-5 h-5 bg-white sharp-edge shadow-sm"
          animate={{ left: checked ? '1.25rem' : '0.125rem' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
    </button>
  );
}

function CollapsibleSection({
  id,
  title,
  icon: Icon,
  openSection,
  onToggle,
  children,
}: {
  id: SectionId;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  openSection: SectionId | null;
  onToggle: (id: SectionId) => void;
  children: React.ReactNode;
}) {
  const isOpen = openSection === id;

  return (
    <div className="bg-white border border-silver/20 sharp-edge overflow-hidden">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-ivory/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-graphite" />
          <span className="text-sm font-medium uppercase tracking-widest text-graphite">{title}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-silver" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 pb-6 border-t border-silver/10 pt-5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AdminSettings() {
  const [settings, setSettings] = useState<PlatformSettings>(() => store.settings.get());
  const [openSection, setOpenSection] = useState<SectionId | null>('platform');
  const [saved, setSaved] = useState(false);

  function toggleSection(id: SectionId) {
    setOpenSection((prev) => (prev === id ? null : id));
  }

  function updateField<K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    store.settings.save(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-light text-graphite mb-2">Impostazioni</h1>
            <p className="text-graphite-light/70">Configurazione generale della piattaforma.</p>
          </div>
          <div className="flex items-center gap-3">
            <AnimatePresence>
              {saved && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-2 text-emerald-600 text-sm font-medium"
                >
                  <Check className="w-4 h-4" /> Salvato
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-3 bg-graphite text-ivory text-sm font-medium uppercase tracking-widest sharp-edge hover:bg-graphite-light transition-colors"
            >
              <Settings className="w-4 h-4" /> Salva Impostazioni
            </button>
          </div>
        </div>

        <div className="space-y-4 max-w-2xl">
          {/* Platform Section */}
          <CollapsibleSection
            id="platform"
            title="Piattaforma"
            icon={Building}
            openSection={openSection}
            onToggle={toggleSection}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-widest text-silver mb-2">
                  Nome Piattaforma
                </label>
                <input
                  type="text"
                  value={settings.platform_name}
                  onChange={(e) => updateField('platform_name', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-silver/30 sharp-edge text-sm text-graphite focus:outline-none focus:border-graphite transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-widest text-silver mb-2">
                  Email Supporto
                </label>
                <input
                  type="email"
                  value={settings.support_email}
                  onChange={(e) => updateField('support_email', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-silver/30 sharp-edge text-sm text-graphite focus:outline-none focus:border-graphite transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-widest text-silver mb-2">
                  Telefono Supporto
                </label>
                <input
                  type="tel"
                  value={settings.support_phone}
                  onChange={(e) => updateField('support_phone', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-silver/30 sharp-edge text-sm text-graphite focus:outline-none focus:border-graphite transition-colors"
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* WhatsApp Section */}
          <CollapsibleSection
            id="whatsapp"
            title="WhatsApp"
            icon={MessageSquare}
            openSection={openSection}
            onToggle={toggleSection}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-widest text-silver mb-2">
                  Numero WhatsApp
                </label>
                <input
                  type="tel"
                  value={settings.whatsapp_number}
                  onChange={(e) => updateField('whatsapp_number', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-silver/30 sharp-edge text-sm text-graphite focus:outline-none focus:border-graphite transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-widest text-silver mb-2">
                  Commissione Piattaforma (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={settings.commission_rate}
                    onChange={(e) => updateField('commission_rate', Number(e.target.value))}
                    className="w-full px-4 py-3 pr-10 bg-white border border-silver/30 sharp-edge text-sm text-graphite focus:outline-none focus:border-graphite transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-silver">%</span>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Notifications Section */}
          <CollapsibleSection
            id="notifications"
            title="Notifiche"
            icon={Bell}
            openSection={openSection}
            onToggle={toggleSection}
          >
            <div className="space-y-1">
              <ToggleSwitch
                checked={settings.notifications_email}
                onChange={(val) => updateField('notifications_email', val)}
                label="Notifiche Email"
              />
              <ToggleSwitch
                checked={settings.notifications_whatsapp}
                onChange={(val) => updateField('notifications_whatsapp', val)}
                label="Notifiche WhatsApp"
              />
              <ToggleSwitch
                checked={settings.notifications_sms}
                onChange={(val) => updateField('notifications_sms', val)}
                label="Notifiche SMS"
              />
            </div>
          </CollapsibleSection>

          {/* Security Section */}
          <CollapsibleSection
            id="security"
            title="Sicurezza"
            icon={Shield}
            openSection={openSection}
            onToggle={toggleSection}
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-silver/10">
                <div>
                  <div className="text-sm text-graphite font-medium">Ultimo Backup</div>
                  <div className="text-xs text-silver mt-1">Backup automatico giornaliero</div>
                </div>
                <span className="text-sm text-graphite-light/70">
                  {new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-silver/10">
                <div>
                  <div className="text-sm text-graphite font-medium">Stato API</div>
                  <div className="text-xs text-silver mt-1">Connessione ai servizi esterni</div>
                </div>
                <span className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                  <span className="w-2 h-2 bg-emerald-500 sharp-edge inline-block" />
                  Operativo
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <div>
                  <div className="text-sm text-graphite font-medium">Versione</div>
                  <div className="text-xs text-silver mt-1">Build corrente della piattaforma</div>
                </div>
                <span className="text-sm text-graphite-light/70 font-mono">v1.0.0</span>
              </div>
            </div>
          </CollapsibleSection>
        </div>
      </motion.div>
    </AdminLayout>
  );
}
