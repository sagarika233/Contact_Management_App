import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface ContactGroup {
  id: string;
  name: string;
  color: string;
  user_id: string;
  created_at: string;
}

export const useContactGroups = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<ContactGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchGroups();
    } else {
      setGroups([]);
      setIsLoading(false);
    }
  }, [user]);

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from("contact_groups")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addGroup = async (name: string, color: string = "#6366f1") => {
    if (!user) return;
    try {
      const { error } = await supabase.from("contact_groups").insert([
        { name, color, user_id: user.id },
      ]);

      if (error) throw error;
      await fetchGroups();
      toast({ title: "Group created", description: `"${name}" group has been created.` });
    } catch (error) {
      console.error("Error adding group:", error);
      toast({ title: "Error", description: "Failed to create group.", variant: "destructive" });
    }
  };

  const deleteGroup = async (id: string) => {
    try {
      const { error } = await supabase.from("contact_groups").delete().eq("id", id);
      if (error) throw error;
      await fetchGroups();
      toast({ title: "Group deleted", description: "Group has been removed." });
    } catch (error) {
      console.error("Error deleting group:", error);
      toast({ title: "Error", description: "Failed to delete group.", variant: "destructive" });
    }
  };

  return { groups, isLoading, addGroup, deleteGroup, refetch: fetchGroups };
};