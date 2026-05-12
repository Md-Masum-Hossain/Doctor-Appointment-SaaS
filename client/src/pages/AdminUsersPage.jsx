import { useState } from 'react'
import { motion } from 'framer-motion'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import DashboardLayout from '../components/layout/DashboardLayout'
import { useUsersQuery, useDeleteUserMutation, useBlockUserMutation } from '../hooks/useUsersQuery'

const adminNavigation = [
  { to: '/admin/dashboard', label: 'Overview' },
  { to: '/admin/doctors/verify', label: 'Doctor verification' },
  { to: '/admin/users', label: 'User management' },
  { to: '/admin/appointments', label: 'Appointments' },
  { to: '/admin/reviews', label: 'Reviews' },
]

function AdminUsersPage() {
  const [page, setPage] = useState(1)
  const [roleFilter, setRoleFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filterParams = {
    page,
    limit: 10,
    ...(roleFilter !== 'all' && { role: roleFilter }),
    ...(searchTerm && { search: searchTerm }),
  }

  const { data, isLoading } = useUsersQuery(filterParams)
  const deleteUserMutation = useDeleteUserMutation()
  const blockUserMutation = useBlockUserMutation()

  const users = data?.items || []
  const pagination = data?.pagination

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }
    try {
      await deleteUserMutation.mutateAsync(userId)
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const handleBlock = async (userId, isBlocked) => {
    try {
      await blockUserMutation.mutateAsync({ id: userId, isBlocked: !isBlocked })
    } catch (error) {
      console.error('Block action failed:', error)
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'border-purple-200 bg-purple-50 text-purple-700'
      case 'doctor':
        return 'border-blue-200 bg-blue-50 text-blue-700'
      case 'patient':
        return 'border-green-200 bg-green-50 text-green-700'
      default:
        return 'border-slate-200 bg-slate-50 text-slate-700'
    }
  }

  return (
    <DashboardLayout
      title="User Management"
      subtitle="Manage all users (patients, doctors, and admins) in the system."
      navigation={adminNavigation}
    >
      <div className="space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Search users</label>
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-primary"
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Filter by role</label>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value)
                  setPage(1)
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-primary"
              >
                <option value="all">All roles</option>
                <option value="patient">Patients</option>
                <option value="doctor">Doctors</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>

          {isLoading && <p className="text-sm text-slate-600">Loading users...</p>}

          {!isLoading && !users.length && (
            <p className="text-sm text-slate-600">No users found matching your filters.</p>
          )}

          {/* Users Table */}
          {!isLoading && users.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Email</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Phone</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Role</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-text font-medium">{user.name}</td>
                      <td className="px-4 py-3 text-slate-600">{user.email}</td>
                      <td className="px-4 py-3 text-slate-600">{user.phone}</td>
                      <td className="px-4 py-3">
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {user.isBlocked ? (
                          <Badge className="border-rose-200 bg-rose-50 text-rose-700">Blocked</Badge>
                        ) : user.isVerified ? (
                          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Verified</Badge>
                        ) : (
                          <Badge className="border-amber-200 bg-amber-50 text-amber-700">Pending</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleBlock(user._id, user.isBlocked)}
                            disabled={blockUserMutation.isPending}
                            className="text-xs px-2 py-1 rounded border border-amber-300 text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                          >
                            {blockUserMutation.isPending ? '...' : user.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            disabled={deleteUserMutation.isPending}
                            className="text-xs px-2 py-1 rounded border border-rose-300 text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                          >
                            {deleteUserMutation.isPending ? '...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && (
            <div className="mt-6 flex items-center gap-3 text-sm">
              <Button
                variant="ghost"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </Button>
              <span className="text-slate-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="ghost"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </motion.section>
      </div>
    </DashboardLayout>
  )
}

export default AdminUsersPage
