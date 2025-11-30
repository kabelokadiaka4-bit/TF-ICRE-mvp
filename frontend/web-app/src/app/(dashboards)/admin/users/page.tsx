"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminService } from "@/lib/api";
import { UserPlus, MoreVertical, Shield } from "lucide-react";
import RoleBasedRoute from "@/components/RoleBasedRoute";

export default function UsersPage() {
  return (
    <RoleBasedRoute allowedRoles={["admin"]}>
      <UsersContent />
    </RoleBasedRoute>
  );
}

function UsersContent() {
  const queryClient = useQueryClient();
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: AdminService.getUsers,
    initialData: []
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string, role: string }) => AdminService.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">User Management</h1>
          <p className="text-sm text-on-surface-variant">Manage access and permissions.</p>
        </div>
        <Button leftIcon={<UserPlus className="w-4 h-4" />}>Invite User</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-on-surface-variant uppercase bg-surface-variant/10 border-b border-white/5">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Last Login</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user: any) => (
                <tr key={user.id} className="hover:bg-surface-variant/5">
                  <td className="px-6 py-4 font-medium text-on-surface">{user.email}</td>
                  <td className="px-6 py-4">
                    <select 
                      value={user.role}
                      onChange={(e) => roleMutation.mutate({ userId: user.id, role: e.target.value })}
                      className="bg-surface-variant/20 border border-white/10 rounded px-2 py-1 text-xs focus:outline-none focus:border-primary"
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="analyst">Analyst</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={user.status === 'active' ? 'success' : 'neutral'}>{user.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1 hover:bg-surface-variant/20 rounded">
                      <MoreVertical className="w-4 h-4 text-on-surface-variant" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
