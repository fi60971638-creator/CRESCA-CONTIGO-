import React, { useState } from 'react';
import { useEvalua } from '../context/EvaluaContext';
import { User, UserRole } from '../types/evalua';
import {
  UserCog,
  PlusCircle,
  Search,
  CheckCircle,
  XCircle,
  Building2,
  Shield,
  Phone,
  Mail,
  Edit2,
  X
} from 'lucide-react';

export const UsersView: React.FC = () => {
  const { users, addUser, updateUser, toggleUserActive, currentUser } = useEvalua();

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('analyst');
  const [roleTitle, setRoleTitle] = useState('Analista de Crédito Junior');
  const [agency, setAgency] = useState('Agencia Principal - Lima Centro');
  const [phone, setPhone] = useState('987-000-111');

  if (currentUser?.role !== 'admin') {
    return (
      <div className="p-8 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400">
        <Shield className="w-8 h-8 text-amber-400 mx-auto mb-2" />
        <p className="font-bold text-white">Acceso Restringido al Módulo de Administración</p>
        <p className="text-xs mt-1">Este módulo solo está habilitado para cuentas con rol de Administrador institucional.</p>
      </div>
    );
  }

  const filteredUsers = users.filter((u) => {
    return (
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.agency.toLowerCase().includes(search.toLowerCase()) ||
      u.roleTitle.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    if (editingUser) {
      updateUser(editingUser.id, {
        name,
        email,
        role,
        roleTitle,
        agency,
        phone
      });
      setEditingUser(null);
    } else {
      addUser({
        name,
        email,
        role,
        roleTitle,
        agency,
        phone,
        active: true
      });
    }

    setShowAddModal(false);
    setName('');
    setEmail('');
  };

  const handleStartEdit = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setRoleTitle(user.roleTitle);
    setAgency(user.agency);
    setPhone(user.phone);
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <UserCog className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Módulo de Administración de Usuarios
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Gestión de analistas, asesores, ejecutivos de crédito y credenciales de acceso
          </p>
        </div>

        <button
          onClick={() => {
            setEditingUser(null);
            setName('');
            setEmail('');
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Crear Usuario</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-full md:w-96 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar usuario por nombre, correo o agencia..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-3 pl-3">Usuario</th>
                <th className="pb-3">Correo Institucional</th>
                <th className="pb-3">Rol / Cargo</th>
                <th className="pb-3">Agencia Asignada</th>
                <th className="pb-3">Teléfono</th>
                <th className="pb-3 text-center">Estado</th>
                <th className="pb-3 pr-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 pl-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div className="font-bold text-slate-200">
                        {u.name}
                        {u.id === currentUser?.id && (
                          <span className="ml-2 text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.2 rounded font-normal">
                            Tú
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 font-mono text-slate-300">
                    {u.email}
                  </td>
                  <td className="py-3.5">
                    <div className="font-semibold text-slate-200">{u.roleTitle}</div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {u.role === 'admin' ? 'Administrador' : 'Usuario de Crédito'}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-300">
                    {u.agency}
                  </td>
                  <td className="py-3.5 text-slate-400">
                    {u.phone}
                  </td>
                  <td className="py-3.5 text-center">
                    {u.active ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        Activo
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 pr-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleStartEdit(u)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                        title="Editar datos de usuario"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleUserActive(u.id)}
                        className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                          u.active ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                        title={u.active ? 'Desactivar usuario' : 'Activar usuario'}
                      >
                        {u.active ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit User */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingUser ? 'Editar Usuario Institucional' : 'Crear Nuevo Usuario'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Juan Pérez Quispe"
                  className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Correo Electrónico Institucional *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="juan.perez@evalua.pe"
                  className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Tipo de Rol</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="analyst">Usuario de Crédito</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Cargo / Título</label>
                  <input
                    type="text"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    placeholder="Analista Senior"
                    className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Agencia Asignada</label>
                <input
                  type="text"
                  value={agency}
                  onChange={(e) => setAgency(e.target.value)}
                  placeholder="Agencia Lima Centro"
                  className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Teléfono Móvil</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="987-654-321"
                  className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl"
                >
                  Guardar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
