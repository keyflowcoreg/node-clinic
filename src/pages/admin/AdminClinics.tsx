import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Building2, Search, Plus, Pencil, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { AdminModal } from '../../components/admin/AdminModal';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { Pagination } from '../../components/admin/Pagination';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';
import { cn } from '../../lib/utils';
import { store } from '../../services/store';
import { useToast } from '../../context/ToastContext';
import type { Clinic, ClinicStatus } from '../../types/database';

const PER_PAGE = 15;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const STATUS_LABELS: Record<ClinicStatus, string> = {
  active: 'Attiva',
  pending: 'In Attesa',
  rejected: 'Rifiutata',
};

const STATUS_BADGE: Record<ClinicStatus, string> = {
  active: 'bg-warm-soft text-warm',
  pending: 'bg-yellow-100 text-yellow-800',
  rejected: 'bg-red-100 text-red-800',
};

type ClinicFormData = {
  name: string;
  slug: string;
  city: string;
  address: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  image_url: string;
  status: ClinicStatus;
};

const EMPTY_FORM: ClinicFormData = {
  name: '',
  slug: '',
  city: '',
  address: '',
  description: '',
  phone: '',
  email: '',
  website: '',
  image_url: '',
  status: 'pending',
};

export function AdminClinics() {
  const { addToast } = useToast();
  const [clinics, setClinics] = useState<Clinic[]>(() => store.clinics.getAll());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ClinicStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ClinicFormData>(EMPTY_FORM);

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmReject, setConfirmReject] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return clinics.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [clinics, search, statusFilter]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PER_PAGE;
    return filtered.slice(start, start + PER_PAGE);
  }, [filtered, currentPage]);

  const totalClinics = clinics.length;
  const activeClinics = clinics.filter((c) => c.status === 'active').length;
  const pendingClinics = clinics.filter((c) => c.status === 'pending').length;

  function refresh() {
    setClinics(store.clinics.getAll());
  }

  function handleFilterChange(value: 'all' | ClinicStatus) {
    setStatusFilter(value);
    setCurrentPage(1);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setCurrentPage(1);
  }

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(c: Clinic) {
    setEditingId(c.id);
    setForm({
      name: c.name,
      slug: c.slug,
      city: c.city,
      address: c.address,
      description: c.description,
      phone: c.phone ?? '',
      email: c.email ?? '',
      website: c.website ?? '',
      image_url: c.image_url,
      status: c.status,
    });
    setModalOpen(true);
  }

  function handleNameChange(name: string) {
    setForm((prev) => ({ ...prev, name, slug: slugify(name) }));
  }

  function handleSave() {
    if (!form.name.trim() || !form.city.trim()) return;

    const payload = {
      name: form.name,
      slug: form.slug,
      city: form.city,
      address: form.address,
      description: form.description,
      phone: form.phone || undefined,
      email: form.email || undefined,
      website: form.website || undefined,
      image_url: form.image_url,
      status: form.status,
    };

    if (editingId) {
      store.clinics.update(editingId, payload);
      addToast('Clinica aggiornata con successo', 'success');
    } else {
      store.clinics.create({
        ...payload,
        lat: 0,
        lng: 0,
        rating: 0,
        reviews_count: 0,
      });
      addToast('Clinica creata con successo', 'success');
    }

    refresh();
    setModalOpen(false);
  }

  function handleApprove(id: string) {
    store.clinics.update(id, { status: 'active' });
    refresh();
    addToast('Clinica approvata', 'success');
  }

  function handleReject(id: string) {
    store.clinics.update(id, { status: 'rejected' });
    refresh();
    setConfirmReject(null);
    addToast('Clinica rifiutata', 'info');
  }

  function handleDelete(id: string) {
    store.clinics.remove(id);
    refresh();
    setConfirmDelete(null);
    addToast('Clinica eliminata', 'error');
  }

  const inputClass =
    'w-full px-4 py-3 bg-white border border-silver/30 sharp-edge text-sm text-graphite placeholder:text-silver focus:outline-none focus:border-graphite transition-colors';
  const labelClass = 'block text-xs font-medium uppercase tracking-widest text-silver mb-2';

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
            <h1 className="text-3xl font-display font-light text-graphite mb-2">Gestione Cliniche</h1>
            <p className="text-graphite-light/70">Approva, modifica e gestisci le cliniche partner.</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-3 bg-graphite text-ivory text-sm font-medium uppercase tracking-widest sharp-edge hover:bg-graphite-light transition-colors"
          >
            <Plus className="w-4 h-4" /> Nuova Clinica
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Cliniche Totali', value: totalClinics, icon: Building2 },
            { label: 'Attive', value: activeClinics, icon: CheckCircle2 },
            { label: 'In Attesa', value: pendingClinics, icon: XCircle },
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
              placeholder="Cerca per nome o città..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-silver/30 sharp-edge text-sm text-graphite placeholder:text-silver focus:outline-none focus:border-graphite transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange(e.target.value as 'all' | ClinicStatus)}
            className="px-4 py-3 bg-white border border-silver/30 sharp-edge text-sm text-graphite focus:outline-none focus:border-graphite transition-colors"
          >
            <option value="all">Tutti gli stati</option>
            <option value="active">Attive</option>
            <option value="pending">In Attesa</option>
            <option value="rejected">Rifiutate</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white border border-silver/20 sharp-edge overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-silver/20">
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">Nome Clinica</th>
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">Città</th>
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">Stato</th>
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">Rating</th>
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">Prenotazioni</th>
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((clinic, i) => {
                const bookingCount = store.bookings.getByClinicId(clinic.id).length;
                return (
                  <motion.tr
                    key={clinic.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.25 }}
                    className="border-b border-silver/10 hover:bg-ivory/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-ivory border border-silver/30 flex items-center justify-center sharp-edge shrink-0">
                          <Building2 className="w-4 h-4 text-graphite" />
                        </div>
                        <span className="font-medium text-graphite">{clinic.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-graphite-light/70">{clinic.city}</td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'inline-block px-3 py-1 text-xs font-medium uppercase tracking-wider sharp-edge',
                          STATUS_BADGE[clinic.status]
                        )}
                      >
                        {STATUS_LABELS[clinic.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-graphite-light/70">
                      {clinic.rating > 0 ? clinic.rating.toFixed(1) : '—'}
                    </td>
                    <td className="px-6 py-4 text-graphite-light/70">{bookingCount}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {clinic.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(clinic.id)}
                              className="p-2 border border-emerald-300 sharp-edge text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Approva"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setConfirmReject(clinic.id)}
                              className="p-2 border border-red-300 sharp-edge text-red-600 hover:bg-red-50 transition-colors"
                              title="Rifiuta"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => openEdit(clinic)}
                          className="p-2 border border-silver/30 sharp-edge text-graphite hover:bg-ivory transition-colors"
                          title="Modifica"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(clinic.id)}
                          className="p-2 border border-red-300 sharp-edge text-red-600 hover:bg-red-50 transition-colors"
                          title="Elimina"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-silver">
                    Nessuna clinica trovata.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          total={filtered.length}
          perPage={PER_PAGE}
          currentPage={currentPage}
          onChange={setCurrentPage}
        />

        {filtered.length > 0 && (
          <div className="mt-3 text-xs text-silver">
            {filtered.length} di {clinics.length} cliniche
          </div>
        )}
      </motion.div>

      {/* Create / Edit Modal */}
      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Modifica Clinica' : 'Nuova Clinica'}
        maxWidth="max-w-2xl"
        footer={
          <>
            <button
              onClick={() => setModalOpen(false)}
              className="px-5 py-3 border border-silver/30 text-sm font-medium uppercase tracking-widest text-graphite sharp-edge hover:bg-ivory transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={handleSave}
              disabled={!form.name.trim() || !form.city.trim()}
              className="px-5 py-3 bg-graphite text-ivory text-sm font-medium uppercase tracking-widest sharp-edge hover:bg-graphite-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {editingId ? 'Salva Modifiche' : 'Crea Clinica'}
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Nome *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className={inputClass}
                placeholder="Nome della clinica"
              />
            </div>
            <div>
              <label className={labelClass}>Slug</label>
              <input
                type="text"
                value={form.slug}
                readOnly
                className="w-full px-4 py-3 bg-ivory border border-silver/20 sharp-edge text-sm text-silver cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Città *</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                className={inputClass}
                placeholder="es. Milano"
              />
            </div>
            <div>
              <label className={labelClass}>Stato</label>
              <select
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as ClinicStatus }))}
                className={inputClass}
              >
                <option value="pending">In Attesa</option>
                <option value="active">Attiva</option>
                <option value="rejected">Rifiutata</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Indirizzo</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
              className={inputClass}
              placeholder="Via e numero civico"
            />
          </div>

          <div>
            <label className={labelClass}>Descrizione</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 bg-white border border-silver/30 sharp-edge text-sm text-graphite placeholder:text-silver focus:outline-none focus:border-graphite transition-colors resize-none"
              placeholder="Descrizione della clinica..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Telefono</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                className={inputClass}
                placeholder="+39 02 ..."
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                className={inputClass}
                placeholder="info@clinica.it"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Sito Web</label>
            <input
              type="text"
              value={form.website}
              onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))}
              className={inputClass}
              placeholder="https://..."
            />
          </div>

          <div>
            <label className={labelClass}>URL Immagine</label>
            <input
              type="text"
              value={form.image_url}
              onChange={(e) => setForm((prev) => ({ ...prev, image_url: e.target.value }))}
              className={inputClass}
              placeholder="https://..."
            />
          </div>
        </div>
      </AdminModal>

      {/* Confirm Reject */}
      <ConfirmDialog
        open={confirmReject !== null}
        title="Rifiuta Clinica"
        message="Sei sicuro di voler rifiutare questa clinica? Lo stato verrà impostato su Rifiutata."
        confirmLabel="Rifiuta"
        variant="danger"
        onConfirm={() => confirmReject && handleReject(confirmReject)}
        onCancel={() => setConfirmReject(null)}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        open={confirmDelete !== null}
        title="Elimina Clinica"
        message="Sei sicuro di voler eliminare questa clinica? Questa azione non può essere annullata."
        confirmLabel="Elimina"
        variant="danger"
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </AdminLayout>
  );
}
