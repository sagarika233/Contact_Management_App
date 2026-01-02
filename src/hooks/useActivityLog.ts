import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Json } from "@/integrations/supabase/types";

export interface ActivityLogEntry {
  id: string;
  user_id: string;
  contact_id: string | null;
  action: string;
  details: Json;
  created_at: string;
}

export const useActivityLog = (contactId?: string) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchActivities();
    } else {
      setActivities([]);
      setIsLoading(false);
    }
  }, [user, contactId]);

  const fetchActivities = async () => {
    try {
      let query = supabase
        .from("activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (contactId) {
        query = query.eq("contact_id", contactId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logActivity = async (action: string, contactId?: string, details?: Json) => {
    if (!user) return;
    try {
      await supabase.from("activity_log").insert([
        { user_id: user.id, contact_id: contactId || null, action, details: details || null },
      ]);
      await fetchActivities();
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  };

  return { activities, isLoading, logActivity, refetch: fetchActivities };
};