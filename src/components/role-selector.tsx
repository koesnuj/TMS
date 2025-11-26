'use client'

import { updateUserRole } from "@/app/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface RoleSelectorProps {
  userId: string;
  currentRole: string;
}

export function RoleSelector({ userId, currentRole }: RoleSelectorProps) {
  const handleRoleChange = async (value: string) => {
    try {
      await updateUserRole(userId, value);
      toast.success("Role updated successfully");
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  return (
    <Select defaultValue={currentRole} onValueChange={handleRoleChange}>
      <SelectTrigger className="h-8 w-24">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="GUEST">GUEST</SelectItem>
        <SelectItem value="QA">QA</SelectItem>
        <SelectItem value="ADMIN">ADMIN</SelectItem>
      </SelectContent>
    </Select>
  );
}

