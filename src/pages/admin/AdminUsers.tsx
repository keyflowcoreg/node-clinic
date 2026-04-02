import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Users, Search, Shield, UserCheck, UserX, Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { AdminModal } from '../../components/admin/AdminModal';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { Pagination } from '../../components/admin/Pagination';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';
import { cn } from '../../lib/utils';
import { store } from '../../services/store';
import { useToast } from '../../context/ToastContext';
import type { User, UserRole, UserStatus } from '../../types/database';

const ROLE_LABELS: Record<UserRole, string> = {
  user: 'Utente',
  clinic: 'Clinica',
  admin: 'Admin',
};

const ROLE_BADGE_CLASS: Record<UserRole, string> = {
  user: 'bg-silver/20 text-graphite',
  clinic: 'bg-warm/20 text-warm',
  admin: 'bg-graphite text-ivory',
};

const STATUS_BADGE_CLASS: Record<UserStatus, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  suspended: 'bg-red-100 text-red-700',
};

type UserFormData = {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
};

const EMPTY_FORM: UserFormData = {
  name: '',
  email: '',
  phone: '',
  role: 'user',
  status: 'active',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const PER_PAGE = 15;

export function AdminUsers() {
  const { addToast } = useToast();
  const [users, setUsers] = useState<User[]>(() => store.users.getAll());
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UserFormData>(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        !search ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PER_PAGE;
    return filtered.slice(start, start + PER_PAGE);
  }, [filtered, currentPage]);

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const newThisMonth = users.filter((u) => u.created_at.startsWith(thisMonth)).length;
  const activeCount = users.filter((u) => u.status === 'active').length;

  function handleFilterChange(fn: () => void) {
    fn();
    setCurrentPage(1);
  }

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(user: User) {
    setEditingId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone ?? '',
      role: user.role,
      status: user.status,
    });
    setModalOpen(true);
  }

  function handleSave() {
    if (!form.name.trim() || !form.email.trim()) return;

    if (editingId) {
      store.users.update(editingId, {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        role: form.role,
        status: form.status,
      });
      addToast('Utente aggiornato con successo');
    } else {
      store.users.create({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        role: form.role,
        status: form.status,
      });
      addToast('Utente creato con successo');
    }

    setUsers(store.users.getAll());
    setModalOpen(false);
  }

  function toggleStatus(user: User) {
    const newStatus: UserStatus = user.status === 'active' ? 'suspended' : 'active';
    store.users.update(user.id, { status: newStatus });
    setUsers(store.users.getAll());
    addToast(newStatus === 'active' ? 'Utente attivato' : 'Utente sospeso', 'info');
  }

  function handleDelete(user: User) {
    if (user.role === 'admin') return;
    store.users.remove(user.id);
    setUsers(store.users.getAll());
    setConfirmDelete(null);
    addToast('Utente eliminato', 'info');
  }

  const isAdminUser = confirmDelete?.role === 'admin';

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
            <h1 className="text-3xl font-display font-light text-graphite mb-2">Gestione Utenti</h1>
            <p className="text-graphite-light/70">Panoramica e gestione degli utenti registrati.</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-3 bg-graphite text-ivory text-sm font-medium uppercase tracking-widest sharp-edge hover:bg-graphite-light transition-colors"
          >
            <Plus className="w-4 h-4" /> Nuovo Utente
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Utenti Totali', value: users.length, icon: Users },
            { label: 'Nuovi Questo Mese', value: newThisMonth, icon: UserCheck },
            { label: 'Attivi', value: activeCount, icon: Shield },
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
              placeholder="Cerca per nome o email..."
              value={search}
              onChange={(e) => handleFilterChange(() => setSearch(e.target.value))}
              className="w-full pl-10 pr-4 py-3 bg-white border border-silver/30 sharp-edge text-sm text-graphite placeholder:text-silver focus:outline-none focus:border-graphite transition-colors"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => handleFilterChange(() => setRoleFilter(e.target.value as 'all' | UserRole))}
            className="px-4 py-3 bg-white border border-silver/30 sharp-edge text-sm text-graphite focus:outline-none focus:border-graphite transition-colors"
          >
            <option value="all">Tutti i ruoli</option>
            <option value="user">Utente</option>
            <option value="clinic">Clinica</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange(() => setStatusFilter(e.target.value as 'all' | UserStatus))}
            className="px-4 py-3 bg-white border border-silver/30 sharp-edge text-sm text-graphite focus:outline-none focus:border-graphite transition-colors"
          >
            <option value="all">Tutti gli stati</option>
            <option value="active">Attivo</option>
            <option value="suspended">Sospeso</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white border border-silver/20 sharp-edge overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-silver/20">
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">Nome</th>
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">Email</th>
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">Ruolo</th>
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">Stato</th>
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">Registrazione</th>
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                  className="border-b border-silver/10 hover:bg-ivory/50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-graphite">{user.name}</td>
                  <td className="px-6 py-4 text-graphite-light/70">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={cn('inline-block px-3 py-1 text-xs font-medium uppercase tracking-wider sharp-edge', ROLE_BADGE_CLASS[user.role])}>
                      {ROLE_LABELS[user.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn('inline-block px-3 py-1 text-xs font-medium uppercase tracking-wider sharp-edge', STATUS_BADGE_CLASS[user.status])}>
                      {user.status === 'active' ? 'Attivo' : 'Sospeso'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-graphite-light/70">{formatDate(user.created_at)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {/* Toggle status */}
                      <button
                        onClick={() => toggleStatus(user)}
                        title={user.status === 'active' ? 'Sospendi' : 'Attiva'}
                        className={cn(
                          'p-2 border sharp-edge transition-colors',
                          user.status === 'active'
                            ? 'border-red-300 text-red-600 hover:bg-red-50'
                            : 'border-emerald-300 text-emerald-600 hover:bg-emerald-50'
                        )}
                      >
                        {user.status === 'active' ? (
                          <ToggleRight className="w-3.5 h-3.5" />
                        ) : (
                          <ToggleLeft className="w-3.5 h-3.5" />
                        )}
                      </button>
                      {/* Edit */}
                      <button
                        onClick={() => openEdit(user)}
                        title="Modifica"
                        className="p-2 border border-silver/30 sharp-edge text-graphite hover:bg-ivory transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {/* Delete - hidden for admins */}
                      {user.role !== 'admin' ? (
                        <button
                          onClick={() => setConfirmDelete(user)}
                          title="Elimina"
                          className="p-2 border border-red-300 sharp-edge text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          disabled
                          title="Non puoi eliminare un amministratore"
                          className="p-2 border border-silver/20 sharp-edge text-silver/40 cursor-not-allowed"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-silver">
                    Nessun utente trovato con i filtri selezionati.
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
          <div className="mt-2 text-xs text-silver">
            {filtered.length} di {users.length} utenti
          </div>
        )}
      </motion.div>

      {/* Create / Edit Modal */}
      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Modifica Utente' : 'Nuovo Utente'}
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
              disabled={!form.name.trim() || !form.email.trim()}
              className="px-5 py-3 bg-graphite text-ivory text-sm font-medium uppercase tracking-widest sharp-edge hover:bg-graphite-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {editingId ? 'Salva Modifiche' : 'Crea Utente'}
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-silver mb-2">Nome</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Nome Cognome"
              className="w-full px-4 py-3 bg-white border border-silver/30 sharp-edge text-sm text-graphite placeholder:text-silver focus:outline-none focus:border-graphite transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-silver mb-2">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="email@esempio.com"
              className="w-full px-4 py-3 bg-white border border-silver/30 sharp-edge text-sm text-graphite placeholder:text-silver focus:outline-none focus:border-graphite transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-silver mb-2">Telefono</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="+39 333 1234567"
              className="w-full px-4 py-3 bg-white border border-silver/30 sharp-edge text-sm text-graphite placeholder:text-silver focus:outline-none focus:border-graphite transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-silver mb-2">Ruolo</label>
            <select
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as UserRole }))}
              className="w-full px-4 py-3 bg-white border border-silver/30 sharp-edge text-sm text-graphite focus:outline-none focus:border-graphite transition-colors"
            >
              <option value="user">Utente</option>
              <option value="clinic">Clinica</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-silver mb-2">Stato</label>
            <select
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as UserStatus }))}
              className="w-full px-4 py-3 bg-white border border-silver/30 sharp-edge text-sm text-graphite focus:outline-none focus:border-graphite transition-colors"
            >
              <option value="active">Attivo</option>
              <option value="suspended">Sospeso</option>
            </select>
          </div>
        </div>
      </AdminModal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={confirmDelete !== null}
        title={isAdminUser ? 'Operazione Non Consentita' : 'Conferma Eliminazione'}
        message={
          isAdminUser
            ? 'Non puoi eliminare un amministratore. Modifica prima il ruolo dell\'utente.'
            : `Sei sicuro di voler eliminare "${confirmDelete?.name}"? Questa azione non può essere annullata.`
        }
        confirmLabel={isAdminUser ? undefined : 'Elimina'}
        variant="danger"
        onConfirm={() => confirmDelete && !isAdminUser && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </AdminLayout>
  );
}
