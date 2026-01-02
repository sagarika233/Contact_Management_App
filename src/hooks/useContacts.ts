import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  message?: string | null;
  created_at: string;
  user_id?: string | null;
  group_id?: string | null;
  avatar_url?: string | null;
}

interface NewContact {
  name: string;
  email: string;
  phone: string;
  message?: string;
}

export const useContacts = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchContacts();

      const channel = supabase
        .channel("contacts-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "contacts",
          },
          () => {
            fetchContacts();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setContacts([]);
      setIsLoading(false);
    }
  }, [user]);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast({
        title: "Error",
        description: "Failed to load contacts. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addContact = async (newContact: NewContact) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("contacts").insert([
        {
          name: newContact.name,
          email: newContact.email,
          phone: newContact.phone,
          message: newContact.message || null,
          user_id: user.id,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Contact has been added successfully.",
      });
    } catch (error) {
      console.error("Error adding contact:", error);
      toast({
        title: "Error",
        description: "Failed to add contact. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateContact = async (id: string, data: { name: string; email: string; phone: string; message?: string }) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("contacts")
        .update({
          name: data.name,
          email: data.email,
          phone: data.phone,
          message: data.message || null,
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Updated!",
        description: "Contact has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating contact:", error);
      toast({
        title: "Error",
        description: "Failed to update contact. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteContact = async (id: string) => {
    setIsDeleting(id);
    try {
      const { error } = await supabase.from("contacts").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Contact has been removed.",
      });
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast({
        title: "Error",
        description: "Failed to delete contact. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const importContacts = async (newContacts: NewContact[]) => {
    if (!user) return;
    setIsImporting(true);
    try {
      const contactsWithUser = newContacts.map((c) => ({
        ...c,
        message: c.message || null,
        user_id: user.id,
      }));

      const { error } = await supabase.from("contacts").insert(contactsWithUser);

      if (error) throw error;

      toast({
        title: "Import Complete",
        description: `${newContacts.length} contacts imported successfully.`,
      });
    } catch (error) {
      console.error("Error importing contacts:", error);
      toast({
        title: "Error",
        description: "Failed to import contacts. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsImporting(false);
    }
  };

  return {
    contacts,
    isLoading,
    isSubmitting,
    isDeleting,
    isUpdating,
    isImporting,
    addContact,
    updateContact,
    deleteContact,
    importContacts,
  };
};
