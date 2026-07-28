'use client';

import { useState } from 'react';
import { useAdminAuth } from './AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';
import { LogOut, Users, CheckCircle, XCircle } from 'lucide-react';

export default function AdminPage() {
  const { admin, login, logout } = useAdminAuth();
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'students' | 'business'>('students');
  const queryClient = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminAPI.getStats(),
    enabled: !!admin,
  });

  const { data: studentsData } = useQuery({
    queryKey: ['admin-students'],
    queryFn: () => adminAPI.getStudents(),
    enabled: !!admin && activeTab === 'students',
  });

  const { data: businessData } = useQuery({
    queryKey: ['admin-business'],
    queryFn: () => adminAPI.getBusiness(),
    enabled: !!admin && activeTab === 'business',
  });

  const approveMutation = useMutation({
    mutationFn: ({ type, id }: { type: 'student' | 'business'; id: string }) =>
      adminAPI.approve(type, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      queryClient.invalidateQueries({ queryKey: ['admin-business'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ type, id }: { type: 'student' | 'business'; id: string }) =>
      adminAPI.reject(type, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      queryClient.invalidateQueries({ queryKey: ['admin-business'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginForm.email, loginForm.password);
      setLoginError('');
    } catch (error: any) {
      setLoginError(error.response?.data?.message || 'Login failed');
    }
  };

  if (!admin) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-dark-surface border border-border-dark rounded-2xl p-8">
          <h1 className="text-3xl font-heading font-bold text-white mb-8 text-center">
            Admin Login
          </h1>
          {loginError && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {loginError}
            </div>
          )}
          <form onSubmit={handleLogin} data-testid="admin-login-form">
            <div className="mb-4">
              <label className="block text-white/80 mb-2 text-sm">Email</label>
              <input
                type="email"
                data-testid="admin-email-input"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className="w-full px-4 py-3 bg-dark-bg border border-border-dark rounded-lg text-white focus:border-white/30 focus:outline-none"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-white/80 mb-2 text-sm">Password</label>
              <input
                type="password"
                data-testid="admin-password-input"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-4 py-3 bg-dark-bg border border-border-dark rounded-lg text-white focus:border-white/30 focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              data-testid="admin-login-button"
              className="w-full px-6 py-3 bg-white text-black rounded-lg font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg flex">
      <div className="w-64 bg-[#0A0A0A] border-r border-border-dark min-h-screen p-6">
        <h2 className="text-2xl font-heading font-bold text-white mb-8">Business Orbit</h2>
        <div className="space-y-2">
          <button
            onClick={() => setActiveTab('students')}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'students' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'
            }`}
          >
            <Users size={20} className="inline mr-3" />
            Students
          </button>
          <button
            onClick={() => setActiveTab('business')}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'business' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'
            }`}
          >
            <Users size={20} className="inline mr-3" />
            Business
          </button>
        </div>
        <button
          onClick={logout}
          className="w-full mt-auto absolute bottom-6 left-6 right-6 px-4 py-3 text-white/60 hover:text-white transition-colors text-left"
        >
          <LogOut size={20} className="inline mr-3" />
          Logout
        </button>
      </div>

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-black mb-6">Dashboard</h1>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-6 bg-white border border-border-light rounded-lg">
              <div className="text-3xl font-heading font-bold text-black mb-2">
                {stats?.data?.students?.total || 0}
              </div>
              <div className="text-black/60">Total Students</div>
            </div>
            <div className="p-6 bg-white border border-border-light rounded-lg">
              <div className="text-3xl font-heading font-bold text-black mb-2">
                {stats?.data?.students?.pending || 0}
              </div>
              <div className="text-black/60">Pending Students</div>
            </div>
            <div className="p-6 bg-white border border-border-light rounded-lg">
              <div className="text-3xl font-heading font-bold text-black mb-2">
                {stats?.data?.business?.total || 0}
              </div>
              <div className="text-black/60">Total Business</div>
            </div>
            <div className="p-6 bg-white border border-border-light rounded-lg">
              <div className="text-3xl font-heading font-bold text-black mb-2">
                {stats?.data?.totalMembers || 0}
              </div>
              <div className="text-black/60">Approved Members</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-border-light rounded-lg overflow-hidden">
          <div className="p-6 border-b border-border-light">
            <h2 className="text-2xl font-heading font-bold text-black">
              {activeTab === 'students' ? 'Students' : 'Business Applications'}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-light-bg">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-black">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-black">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-black">
                    {activeTab === 'students' ? 'College' : 'Company'}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-black">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-black">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {activeTab === 'students' &&
                  studentsData?.data?.students?.map((student: any) => (
                    <tr key={student.id}>
                      <td className="px-6 py-4 text-black">{student.name}</td>
                      <td className="px-6 py-4 text-black/70 text-sm">{student.email}</td>
                      <td className="px-6 py-4 text-black/70 text-sm">{student.college}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            student.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : student.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => approveMutation.mutate({ type: 'student', id: student.id })}
                            className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                            disabled={student.status === 'approved'}
                          >
                            <CheckCircle size={20} />
                          </button>
                          <button
                            onClick={() => rejectMutation.mutate({ type: 'student', id: student.id })}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            disabled={student.status === 'rejected'}
                          >
                            <XCircle size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                {activeTab === 'business' &&
                  businessData?.data?.businesses?.map((business: any) => (
                    <tr key={business.id}>
                      <td className="px-6 py-4 text-black">{business.name}</td>
                      <td className="px-6 py-4 text-black/70 text-sm">{business.email}</td>
                      <td className="px-6 py-4 text-black/70 text-sm">{business.company}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            business.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : business.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {business.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => approveMutation.mutate({ type: 'business', id: business.id })}
                            className="p-2 text-green-600 hover:bg-red-50 rounded transition-colors"
                            disabled={business.status === 'approved'}
                          >
                            <CheckCircle size={20} />
                          </button>
                          <button
                            onClick={() => rejectMutation.mutate({ type: 'business', id: business.id })}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            disabled={business.status === 'rejected'}
                          >
                            <XCircle size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
