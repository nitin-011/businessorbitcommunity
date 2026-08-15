"use client";

import { useState } from "react";
import { useAdminAuth } from "./AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api";
import { LogOut, CheckCircle, XCircle, Lock } from "lucide-react";
import { Bebas_Neue } from "next/font/google";
import InteractiveSphere from "@/components/InteractiveSphere";

const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400" });

const inputClasses =
  "w-full px-4 py-3 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl text-[#111111] focus:bg-[#FFFFFF] focus:border-[#D4FF3F] focus:ring-1 focus:ring-[#D4FF3F] focus:outline-none focus:shadow-[0_0_12px_rgba(212,255,63,0.3)] transition-all";

export default function AdminPage() {
  const { admin, login, logout, isLoading } = useAdminAuth();
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "pending" | "rejected" | "members"
  >("pending");
  const queryClient = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminAPI.getStats(),
    enabled: !!admin,
  });

  const { data: pendingData } = useQuery({
    queryKey: ["admin-business", "pending"],
    queryFn: () => adminAPI.getBusiness({ status: "pending" }),
    enabled: !!admin && activeTab === "pending",
  });

  const { data: rejectedData } = useQuery({
    queryKey: ["admin-business", "rejected"],
    queryFn: () => adminAPI.getBusiness({ status: "rejected" }),
    enabled: !!admin && activeTab === "rejected",
  });

  const { data: membersData } = useQuery({
    queryKey: ["admin-members"],
    queryFn: () => adminAPI.getCommunityMembers(),
    enabled: !!admin && activeTab === "members",
  });

  const approveMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => adminAPI.approve("business", id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-business"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-members"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => adminAPI.reject("business", id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-business"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-members"] });
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError("");
    try {
      await login(loginForm.email, loginForm.password);
      setLoginError("");
    } catch (error: any) {
      setLoginError(
        error.response?.data?.message ||
          "Invalid credentials. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#121212] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#D4FF3F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!admin) {
    return (
      <>
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @import url('https://fonts.cdnfonts.com/css/glacial-indifference-2');
            .font-glacial { font-family: 'Glacial Indifference', sans-serif; }
          `,
          }}
        />
        <div
          data-testid="admin-login-page"
          className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#121212] flex items-center justify-center px-6 overflow-hidden relative font-glacial"
        >
          <div className="absolute inset-0 z-0 opacity-40">
            <InteractiveSphere />
          </div>

          <div
            className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />

          <div className="relative z-10 w-full max-w-md">
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-full bg-[#D4FF3F]/10 border border-[#D4FF3F]/30 flex items-center justify-center mx-auto mb-5">
                <Lock className="w-5 h-5 text-[#D4FF3F]" />
              </div>
              <h1
                className={`${bebas.className} text-[32px] md:text-[40px] text-[#F5F5F5] uppercase leading-[1.1] mb-2`}
              >
                Admin Access
              </h1>
              <p className="text-[15px] text-[#A1A1A1] font-glacial">
                Sign in to manage the Business Orbit platform.
              </p>
            </div>

            {loginError && (
              <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-glacial">
                {loginError}
              </div>
            )}

            <div className="bg-[#FFFFFF] rounded-2xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <form
                onSubmit={handleLogin}
                className="space-y-4"
                data-testid="admin-login-form"
              >
                <div>
                  <label
                    htmlFor="admin-email"
                    className="block text-[#111111] font-medium mb-1.5 text-sm"
                  >
                    Email
                  </label>
                  <input
                    id="admin-email"
                    type="email"
                    data-testid="admin-email-input"
                    value={loginForm.email}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, email: e.target.value })
                    }
                    className={inputClasses}
                    placeholder="admin@boc.com"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="admin-password"
                    className="block text-[#111111] font-medium mb-1.5 text-sm"
                  >
                    Password
                  </label>
                  <input
                    id="admin-password"
                    type="password"
                    data-testid="admin-password-input"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, password: e.target.value })
                    }
                    className={inputClasses}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    data-testid="admin-login-button"
                    className="w-full px-6 py-4 bg-[#D4FF3F] text-black rounded-full font-bold text-[16px] tracking-wide transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(212,255,63,0.5)] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
                  >
                    {isSubmitting ? "Signing In…" : "Sign In"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg flex">
      <div className="w-64 bg-[#0A0A0A] border-r border-border-dark min-h-screen p-6 relative">
        <h2 className="text-2xl font-heading font-bold text-white mb-8">
          Business Orbit
        </h2>
        <button
          onClick={logout}
          className="w-full absolute bottom-6 left-6 right-6 px-4 py-3 text-white/60 hover:text-white transition-colors text-left"
        >
          <LogOut size={20} className="inline mr-3" />
          Logout
        </button>
      </div>

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-black mb-6">
            Dashboard
          </h1>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-white border border-border-light rounded-lg">
              <div className="text-3xl font-heading font-bold text-black mb-2">
                {stats?.data?.business?.total || 0}
              </div>
              <div className="text-black/60">Total Business Applications</div>
            </div>
            <div className="p-6 bg-white border border-border-light rounded-lg">
              <div className="text-3xl font-heading font-bold text-black mb-2">
                {stats?.data?.totalMembers || 0}
              </div>
              <div className="text-black/60">Total Community Members</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-border-light rounded-lg overflow-hidden">
          <div className="border-b border-border-light flex">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-6 py-4 font-semibold text-sm focus:outline-none ${activeTab === "pending" ? "border-b-2 border-black text-black" : "text-gray-500 hover:text-black"}`}
            >
              Pending Applications
            </button>
            <button
              onClick={() => setActiveTab("rejected")}
              className={`px-6 py-4 font-semibold text-sm focus:outline-none ${activeTab === "rejected" ? "border-b-2 border-black text-black" : "text-gray-500 hover:text-black"}`}
            >
              Rejected Applications
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`px-6 py-4 font-semibold text-sm focus:outline-none ${activeTab === "members" ? "border-b-2 border-black text-black" : "text-gray-500 hover:text-black"}`}
            >
              Community Members
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-light-bg">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-black">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-black">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-black">
                    {activeTab === "members" ? "Role" : "Company"}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-black">
                    Status
                  </th>
                  {activeTab !== "members" && (
                    <th className="px-6 py-4 text-left text-sm font-semibold text-black">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {activeTab === "pending" &&
                  pendingData?.data?.businesses?.map((business: any) => (
                    <tr key={business.id}>
                      <td className="px-6 py-4 text-black">{business.name}</td>
                      <td className="px-6 py-4 text-black/70 text-sm">
                        {business.email}
                      </td>
                      <td className="px-6 py-4 text-black/70 text-sm">
                        {business.company}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              approveMutation.mutate({ id: business.id })
                            }
                            aria-label={`Approve ${business.name}`}
                            className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                          >
                            <CheckCircle size={20} />
                          </button>
                          <button
                            onClick={() =>
                              rejectMutation.mutate({ id: business.id })
                            }
                            aria-label={`Reject ${business.name}`}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <XCircle size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                {activeTab === "rejected" &&
                  rejectedData?.data?.businesses?.map((business: any) => (
                    <tr key={business.id}>
                      <td className="px-6 py-4 text-black">{business.name}</td>
                      <td className="px-6 py-4 text-black/70 text-sm">
                        {business.email}
                      </td>
                      <td className="px-6 py-4 text-black/70 text-sm">
                        {business.company}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Rejected
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              approveMutation.mutate({ id: business.id })
                            }
                            className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                          >
                            <CheckCircle size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                {activeTab === "members" &&
                  membersData?.data?.members?.map((member: any) => (
                    <tr key={member.id}>
                      <td className="px-6 py-4 text-black">{member.name}</td>
                      <td className="px-6 py-4 text-black/70 text-sm">
                        {member.email}
                      </td>
                      <td className="px-6 py-4 text-black/70 text-sm">
                        {member.role}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">
                          Active Member
                        </span>
                      </td>
                    </tr>
                  ))}

                {((activeTab === "pending" &&
                  pendingData?.data?.businesses?.length === 0) ||
                  (activeTab === "rejected" &&
                    rejectedData?.data?.businesses?.length === 0) ||
                  (activeTab === "members" &&
                    membersData?.data?.members?.length === 0)) && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No records found in this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
