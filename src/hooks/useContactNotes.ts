import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface ContactNote {
  id: string;
  contact_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export const useContactNotes = (contactId?: string) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<ContactNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && contactId) {
      fetchNotes();
    } else {
      setNotes([]);
      setIsLoading(false);
    }
  }, [user, contactId]);

  const fetchNotes = async () => {
    if (!contactId) return;
    try {
      const { data, error } = await supabase
        .from("contact_notes")
        .select("*")
        .eq("contact_id", contactId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addNote = async (content: string) => {
    if (!user || !contactId) return;
    try {
      const { error } = await supabase.from("contact_notes").insert([
        { contact_id: contactId, user_id: user.id, content },
      ]);

      if (error) throw error;
      await fetchNotes();
      toast({ title: "Note added", description: "Your note has been saved." });
    } catch (error) {
      console.error("Error adding note:", error);
      toast({ title: "Error", description: "Failed to add note.", variant: "destructive" });
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase.from("contact_notes").delete().eq("id", noteId);
      if (error) throw error;
      await fetchNotes();
      toast({ title: "Note deleted", description: "Note has been removed." });
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({ title: "Error", description: "Failed to delete note.", variant: "destructive" });
    }
  };

  return { notes, isLoading, addNote, deleteNote, refetch: fetchNotes };
};