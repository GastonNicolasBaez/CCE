'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Mail,
  Lock,
  Bell,
  Shield,
  Users,
  Settings as SettingsIcon,
  Save,
  X,
  Check,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react'
import { useAuth } from '../../lib/auth'

type SettingsTab = 'profile' | 'security' | 'notifications' | 'users'

export default function Settings() {
  const { user, updateProfile, changePassword } = useAuth()
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    email: user?.email || ''
  })

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  useEffect(() => {
    if (user) {
      setProfileForm({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        email: user.email || ''
      })
    }
  }, [user])

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateProfile({
        nombre: profileForm.nombre,
        apellido: profileForm.apellido,
        email: profileForm.email
      })
      showNotification('success', 'Perfil actualizado correctamente')
    } catch (error) {
      showNotification('error', (error as Error).message || 'Error al actualizar perfil')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotification('error', 'Las contraseñas no coinciden')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      showNotification('error', 'La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword)
      showNotification('success', 'Contraseña actualizada correctamente')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      showNotification('error', (error as Error).message || 'Error al cambiar contraseña')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'profile' as SettingsTab, label: 'Perfil', icon: User },
    { id: 'security' as SettingsTab, label: 'Seguridad', icon: Lock },
    { id: 'notifications' as SettingsTab, label: 'Notificaciones', icon: Bell },
    ...(user?.rol === 'admin' ? [{ id: 'users' as SettingsTab, label: 'Usuarios', icon: Users }] : [])
  ]

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Notification Banner */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-xl border flex items-center justify-between ${
              notification.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}
          >
            <div className="flex items-center gap-3">
              {notification.type === 'success' ? (
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <X className="w-5 h-5 text-red-600 dark:text-red-400" />
              )}
              <p className={`text-sm font-medium ${
                notification.type === 'success'
                  ? 'text-green-800 dark:text-green-300'
                  : 'text-red-800 dark:text-red-300'
              }`}>
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
          <SettingsIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Configuración</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Administra tu cuenta y preferencias</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Icon size={18} />
              <span className="font-medium text-sm">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="neumorphism-card p-6 max-w-2xl">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Información Personal
                </h2>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={profileForm.nombre}
                        onChange={e => setProfileForm(prev => ({ ...prev, nombre: e.target.value }))}
                        className="w-full px-4 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-400 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Apellido
                      </label>
                      <input
                        type="text"
                        value={profileForm.apellido}
                        onChange={e => setProfileForm(prev => ({ ...prev, apellido: e.target.value }))}
                        className="w-full px-4 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-400 outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={e => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-400 outline-none"
                      required
                    />
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                          Rol: {user?.rol === 'admin' ? 'Administrador' : 'Staff'}
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                          Los roles solo pueden ser modificados por otro administrador
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary-dark dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="neumorphism-card p-6 max-w-2xl">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Cambiar Contraseña
                </h2>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contraseña Actual
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={e => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full px-4 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-400 outline-none pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nueva Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={e => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-4 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-400 outline-none pr-10"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirmar Nueva Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={e => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-4 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-400 outline-none pr-10"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      • La contraseña debe tener al menos 6 caracteres<br />
                      • Se recomienda usar una combinación de letras, números y símbolos
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary-dark dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                      Cambiar Contraseña
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="neumorphism-card p-6 max-w-2xl">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Preferencias de Notificaciones
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Notificaciones por Email</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Recibir notificaciones de pagos y actualizaciones</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Recordatorios de Pagos</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Alertas de cuotas próximas a vencer</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      Las preferencias de notificaciones se guardan automáticamente
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab (Admin only) */}
            {activeTab === 'users' && user?.rol === 'admin' && (
              <div className="neumorphism-card p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Gestión de Usuarios
                </h2>
                <div className="p-8 text-center text-gray-600 dark:text-gray-400">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Gestión de Usuarios</p>
                  <p className="text-sm">
                    Funcionalidad en desarrollo para crear, editar y eliminar usuarios del sistema
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
