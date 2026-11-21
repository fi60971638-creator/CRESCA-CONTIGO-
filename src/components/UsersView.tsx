import React, { useState } from 'react';
import { useEvalua } from '../context/EvaluaContext';
import { User, UserRole } from '../types/evalua';
import {
  UserCog,
  PlusCircle,
  Search,
  Shield,
  Edit2,
  X
} from 'lucide-react';

export const UsersView: React.FC = () => {
  const { users, addUser, updateUser, toggleUserActive, currentUser } = useEvalua();

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('analyst');
  const [roleTitle, setRoleTitle] = useState('Analista de Crédito Junior');
  const [agency, setAgency] = useState('Agencia Principal - Lima Centro');
  const [phone, setPhone] = useState('987-000-111');

  if (currentUser?.role !== 'admin') {
    return (
      <div className="p-10 text-center bg-white rounded-2xl border border-slate-200/90 shadow-xs max-w-xl mx-auto mt-8">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-3">
          <Shield className="w-6 h-6" />
        </div>
        <p className="font-extrabold text-[#0B2545] text-base">Acceso Restringido al Módulo de Administración</p>
        <p className="text-xs text-slate-500 mt-1.5">
          Este módulo solo está habilitado para cuentas con rol de Administrador institucional.
        </p>
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
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/70 text-[#1D63ED] flex items-center justify-center shrink-0">
            <UserCog className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0B2545] tracking-tight">
              Administración de Usuarios y Roles
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Gestión de analistas, asesores de negocios, roles y permisos institucionales
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingUser(null);
            setName('');
            setEmail('');
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#1D63ED] hover:bg-[#1552CC] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Crear usuario</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-full md:w-96 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar usuario por nombre, correo o agencia..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#1D63ED] focus:ring-2 focus:ring-blue-500/15"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 pl-3">Usuario</th>
                <th className="py-3">Correo Institucional</th>
                <th className="py-3">Rol / Cargo</th>
                <th className="py-3">Agencia Asignada</th>
                <th className="py-3">Teléfono</th>
                <th className="py-3 text-center">Estado</th>
                <th className="py-3 pr-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="py-3.5 pl-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 text-[#1D63ED] flex items-center justify-center text-xs font-extrabold shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div className="font-bold text-[#0B2545]">
                        {u.name}
                        {u.id === currentUser?.id && (
                          <span className="ml-2 text-[10px] bg-blue-50 text-[#1D63ED] border border-blue-200 px-1.5 py-0.5 rounded-full font-bold">
                            Tú
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 font-mono text-slate-600">
                    {u.email}
                  </td>
                  <td className="py-3.5">
                    <div className="font-semibold text-[#0B2545]">{u.roleTitle}</div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {u.role === 'admin' ? 'Administrador' : 'Usuario de Crédito'}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-600">
                    {u.agency}
                  </td>
                  <td className="py-3.5 text-slate-600 font-mono">
                    {u.phone}
                  </td>
                  <td className="py-3.5 text-center">
                    {u.active ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Activo
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 pr-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleStartEdit(u)}
                        className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-[#0B2545] hover:bg-slate-200 cursor-pointer"
                        title="Editar datos de usuario"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleUserActive(u.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                          u.active
                            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        }`}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-[#0B2545]">
                {editingUser ? 'Editar Usuario Institucional' : 'Crear Nuevo Usuario'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Juan Pérez Quispe"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:bg-white focus:border-[#1D63ED]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Correo Electrónico Institucional *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="juan.perez@evalua.pe"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:bg-white focus:border-[#1D63ED]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo de Rol</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:border-[#1D63ED]"
                  >
                    <option value="analyst">Usuario de Crédito</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cargo / Título</label>
                  <input
                    type="text"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    placeholder="Analista Senior"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:bg-white focus:border-[#1D63ED]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Agencia Asignada</label>
                <input
                  type="text"
                  value={agency}
                  onChange={(e) => setAgency(e.target.value)}
                  placeholder="Agencia Lima Centro"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:bg-white focus:border-[#1D63ED]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Teléfono Móvil</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="987-654-321"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:bg-white focus:border-[#1D63ED]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1D63ED] hover:bg-[#1552CC] text-white font-bold rounded-xl cursor-pointer"
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
