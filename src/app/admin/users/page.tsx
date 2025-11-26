import { getUsers, updateUserStatus, resetUserPassword } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, KeyRound, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { RoleSelector } from "@/components/role-selector";

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Approve new users and manage accounts.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <RoleSelector userId={user.id} currentRole={user.role} />
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={user.status === 'ACTIVE' ? 'secondary' : user.status === 'REJECTED' ? 'destructive' : 'default'}
                      className={user.status === 'ACTIVE' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.createdAt.toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {user.status === 'PENDING' && (
                        <>
                          <form action={updateUserStatus.bind(null, user.id, 'ACTIVE')}>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-green-600">
                              <Check className="h-4 w-4" />
                              <span className="sr-only">Approve</span>
                            </Button>
                          </form>
                          <form action={updateUserStatus.bind(null, user.id, 'REJECTED')}>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600">
                              <X className="h-4 w-4" />
                              <span className="sr-only">Reject</span>
                            </Button>
                          </form>
                        </>
                      )}
                      <form action={resetUserPassword.bind(null, user.id)}>
                         <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Reset Password to '12345678'">
                          <KeyRound className="h-4 w-4" />
                          <span className="sr-only">Reset Password</span>
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
