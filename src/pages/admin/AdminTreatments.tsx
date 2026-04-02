import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Stethoscope, Search, Plus, Pencil, Trash2, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';
import { cn } from '../../lib/utils';
import { store } from '../../services/store';
import type { Treatment, TreatmentCategory } from '../../types/database';

const CATEGORIES: TreatmentCategory[] = ['iniettivi', 'laser', 'corpo', 'viso', 'chirurgia'];

const CATEGORY_LABELS: Record<TreatmentCategory, string> = {
  iniettivi: 'Iniettivi',
  laser: 'Laser',
  corpo: 'Corpo',
  viso: 'Viso',
  chirurgia: 'Chirurgia',
};

const CATEGORY_BADGE_CLASS: Record<TreatmentCategory, string> = {
  iniettivi: 'bg-warm/20 text-warm',
  laser: 'bg-amber-100 text-amber-700',
  corpo: 'bg-orange-100 text-orange-700',
  viso: 'bg-rose-100 text-rose-700',
  chirurgia: 'bg-stone-200 text-stone-700',
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

type TreatmentFormData = {
  name: string;
  slug: string;
  category: TreatmentCategory;
  description: string;
  price_from: number;
  price_to: number;
  duration_min: number;
  image_url: string;
  status: 'active' | 'inactive';
};

const EMPTY_FORM: TreatmentFormData = {
  name: '',
  slug: '',
  category: 'iniettivi',
  description: '',
  price_from: 0,
  price_to: 0,
  duration_min: 30,
  image_url: '',
  status: 'active',
};

export function AdminTreatments() {
  const [treatments, setTreatments] = useState<Treatment[]>(() => store.treatments.getAll());
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | TreatmentCategory>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TreatmentFormData>(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return treatments.filter((t) => {
      const matchesSearch = !search || t.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [treatments, search, categoryFilter]);

  const activeTreatments = treatments.filter((t) => t.status !== 'inactive').length;
  const uniqueCategories = new Set(treatments.map((t) => t.category)).size;

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(t: Treatment) {
    setEditingId(t.id);
    setForm({
      name: t.name,
      slug: t.slug,
      category: t.category,
      description: t.description,
      price_from: t.price_from,
      price_to: t.price_to,
      duration_min: t.duration_min,
      image_url: t.image_url,
      status: t.status ?? 'active',
    });
    setModalOpen(true);
  }

  function handleNameChange(name: string) {
    setForm((prev) => ({ ...prev, name, slug: slugify(name) }));
  }

  function handleSave() {
    if (!form.name.trim()) return;

    if (editingId) {
      store.treatments.update(editingId, {
        name: form.name,
        slug: form.slug,
        category: form.category,
        description: form.description,
        price_from: form.price_from,
        price_to: form.price_to,
        duration_min: form.duration_min,
        image_url: form.image_url,
        status: form.status,
      });
    } else {
      store.treatments.create({
        name: form.name,
        slug: form.slug,
        category: form.category,
        description: form.description,
        price_from: form.price_from,
        price_to: form.price_to,
        duration_min: form.duration_min,
        image_url: form.image_url,
        status: form.status,
      });
    }

    setTreatments(store.treatments.getAll());
    setModalOpen(false);
  }

  function toggleActive(t: Treatment) {
    const newStatus = t.status === 'inactive' ? 'active' : 'inactive';
    store.treatments.update(t.id, { status: newStatus });
    setTreatments(store.treatments.getAll());
  }

  function handleDelete(id: string) {
    store.treatments.remove(id);
    setTreatments(store.treatments.getAll());
    setConfirmDelete(null);
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
            <h1 className="text-3xl font-display font-light text-graphite mb-2">Gestione Trattamenti</h1>
            <p className="text-graphite-light/70">Catalogo e configurazione dei trattamenti disponibili.</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-3 bg-graphite text-ivory text-sm font-medium uppercase tracking-widest sharp-edge hover:bg-graphite-light transition-colors"
          >
            <Plus className="w-4 h-4" /> Nuovo Trattamento
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Trattamenti Totali', value: treatments.length, icon: Stethoscope },
            { label: 'Attivi', value: activeTreatments, icon: ToggleRight },
            { label: 'Categorie', value: uniqueCategories, icon: Stethoscope },
          ].map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-silver/20 p-6 sharp-edge"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="text-sm font-medium uppercase tracking-widest text-silver">{kpi.label}</div>
                  <Icon className="w-5 h-5 text-graphite" />
                </div>
                <AnimatedCounter value={kpi.value} className="text-4xl font-display font-light text-graphite" />
              </motion.div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver" />
            <input
              type="text"
              placeholder="Cerca trattamento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-silver/30 sharp-edge text-sm text-graphite placeholder:text-silver focus:outline-none focus:border-graphite transition-colors"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as 'all' | TreatmentCategory)}
            className="px-4 py-3 bg-white border border-silver/30 sharp-edge text-sm text-graphite focus:outline-none focus:border-graphite transition-colors"
          >
            <option value="all">Tutte le categorie</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white border border-silver/20 sharp-edge overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-silver/20">
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">Nome</th>
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">Categoria</th>
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">Range Prezzo</th>
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">Durata</th>
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">Stato</th>
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <motion.tr
                  key={t.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                  className={cn(
                    'border-b border-silver/10 hover:bg-ivory/50 transition-colors',
                    t.status === 'inactive' && 'opacity-50'
                  )}
                >
                  <td className="px-6 py-4 font-medium text-graphite">{t.name}</td>
                  <td className="px-6 py-4">
                    <span className={cn('inline-block px-3 py-1 text-xs font-medium uppercase tracking-wider sharp-edge', CATEGORY_BADGE_CLASS[t.category])}>
                      {CATEGORY_LABELS[t.category]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-graphite-light/70">
                    {t.price_from.toLocaleString('it-IT')} - {t.price_to.toLocaleString('it-IT')}
                  </td>
                  <td className="px-6 py-4 text-graphite-light/70">{t.duration_min} min</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleActive(t)}
                      className="flex items-center gap-1.5 text-xs"
                      title={t.status === 'inactive' ? 'Attiva' : 'Disattiva'}
                    >
                      {t.status === 'inactive' ? (
                        <ToggleLeft className="w-6 h-6 text-silver" />
                      ) : (
                        <ToggleRight className="w-6 h-6 text-emerald-600" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(t)}
                        className="p-2 border border-silver/30 sharp-edge text-graphite hover:bg-ivory transition-colors"
                        title="Modifica"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(t.id)}
                        className="p-2 border border-red-300 sharp-edge text-red-600 hover:bg-red-50 transition-colors"
                        title="Elimina"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-silver">
                    Nessun trattamento trovato.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-xs text-silver">
          {filtered.length} di {treatments.length} trattamenti
        </div>
      </motion.div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-graphite/60 p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="bg-white sharp-edge w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b border-silver/20">
                <h2 className="text-lg font-display font-medium text-graphite uppercase tracking-wider">
                  {editingId ? 'Modifica Trattamento' : 'Nuovo Trattamento'}
                </h2>
                <button onClick={() => setModalOpen(false)} className="p-1 text-silver hover:text-graphite transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest text-silver mb-2">Nome</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-silver/30 sharp-edge text-sm text-graphite focus:outline-none focus:border-graphite transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest text-silver mb-2">Slug</label>
                  <input
                    type="text"
                    value={form.slug}
                    readOnly
                    className="w-full px-4 py-3 bg-ivory border border-silver/20 sharp-edge text-sm text-silver cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest text-silver mb-2">Categoria</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value as TreatmentCategory }))}
                    className="w-full px-4 py-3 bg-white border border-silver/30 sharp-edge text-sm text-graphite focus:outline-none focus:border-graphite transition-colors"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest text-silver mb-2">Descrizione</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-silver/30 sharp-edge text-sm text-graphite focus:outline-none focus:border-graphite transition-colors resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-widest text-silver mb-2">Prezzo Da (EUR)</label>
                    <input
                      type="number"
                      min={0}
                      value={form.price_from}
                      onChange={(e) => setForm((prev) => ({ ...prev, price_from: Number(e.target.value) }))}
                      className="w-full px-4 py-3 bg-white border border-silver/30 sharp-edge text-sm text-graphite focus:outline-none focus:border-graphite transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-widest text-silver mb-2">Prezzo A (EUR)</label>
                    <input
                      type="number"
                      min={0}
                      value={form.price_to}
                      onChange={(e) => setForm((prev) => ({ ...prev, price_to: Number(e.target.value) }))}
                      className="w-full px-4 py-3 bg-white border border-silver/30 sharp-edge text-sm text-graphite focus:outline-none focus:border-graphite transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest text-silver mb-2">Durata (min)</label>
                  <input
                    type="number"
                    min={1}
                    value={form.duration_min}
                    onChange={(e) => setForm((prev) => ({ ...prev, duration_min: Number(e.target.value) }))}
                    className="w-full px-4 py-3 bg-white border border-silver/30 sharp-edge text-sm text-graphite focus:outline-none focus:border-graphite transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest text-silver mb-2">URL Immagine</label>
                  <input
                    type="text"
                    value={form.image_url}
                    onChange={(e) => setForm((prev) => ({ ...prev, image_url: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border border-silver/30 sharp-edge text-sm text-graphite focus:outline-none focus:border-graphite transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-silver/20">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-3 border border-silver/30 text-sm font-medium uppercase tracking-widest text-graphite sharp-edge hover:bg-ivory transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleSave}
                  className="px-5 py-3 bg-graphite text-ivory text-sm font-medium uppercase tracking-widest sharp-edge hover:bg-graphite-light transition-colors"
                >
                  {editingId ? 'Salva Modifiche' : 'Crea Trattamento'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Dialog */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-graphite/60 p-4"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white sharp-edge p-8 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-display font-medium text-graphite mb-3">Conferma Eliminazione</h3>
              <p className="text-sm text-graphite-light/70 mb-6">
                Sei sicuro di voler eliminare questo trattamento? Questa azione non puo' essere annullata.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2.5 border border-silver/30 text-sm font-medium uppercase tracking-widest text-graphite sharp-edge hover:bg-ivory transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  className="px-4 py-2.5 bg-red-600 text-white text-sm font-medium uppercase tracking-widest sharp-edge hover:bg-red-700 transition-colors"
                >
                  Elimina
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
