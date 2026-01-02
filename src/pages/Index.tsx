import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ContactForm } from "@/components/ContactForm";
import { ContactList } from "@/components/ContactList";
import { useContacts } from "@/hooks/useContacts";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GroupManager } from "@/components/GroupManager";
import { ActivityLogPanel } from "@/components/ActivityLogPanel";
import { Button } from "@/components/ui/button";
import { BookUser, LogOut, Loader2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const { 
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
  } = useContacts();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  // Filter contacts by selected group
  const filteredByGroup = selectedGroupId
    ? contacts.filter((c) => c.group_id === selectedGroupId)
    : contacts;

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <BookUser className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">ContactHub</h1>
              <p className="text-xs text-muted-foreground">Welcome, {user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Group Filter */}
          <div className="mb-6">
            <GroupManager 
              selectedGroupId={selectedGroupId} 
              onGroupSelect={setSelectedGroupId} 
            />
          </div>

          <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
            {/* Form Section */}
            <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              <ContactForm onSubmit={addContact} isSubmitting={isSubmitting} />
              <ActivityLogPanel />
            </div>

            {/* List Section */}
            <div>
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground">Loading contacts...</p>
                  </div>
                </div>
              ) : (
                <ContactList 
                  contacts={filteredByGroup} 
                  onDelete={deleteContact}
                  onUpdate={updateContact}
                  onImport={importContacts}
                  isDeleting={isDeleting}
                  isUpdating={isUpdating}
                  isImporting={isImporting}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;