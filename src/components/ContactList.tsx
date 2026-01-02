import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Trash2, ArrowUpDown, Mail, Phone, MessageSquare, Calendar, Pencil, StickyNote, User } from "lucide-react";
import { format } from "date-fns";
import { SearchFilter } from "@/components/SearchFilter";
import { ImportExportButtons } from "@/components/ImportExportButtons";
import { EditContactDialog } from "@/components/EditContactDialog";
import { ContactNotesDialog } from "@/components/ContactNotesDialog";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  message?: string | null;
  created_at: string;
  group_id?: string | null;
  avatar_url?: string | null;
}

interface ContactListProps {
  contacts: Contact[];
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, data: { name: string; email: string; phone: string; message?: string }) => Promise<void>;
  onImport: (contacts: { name: string; email: string; phone: string; message?: string }[]) => Promise<void>;
  isDeleting: string | null;
  isUpdating: boolean;
  isImporting: boolean;
}

type SortField = "name" | "email" | "created_at";
type SortOrder = "asc" | "desc";

export const ContactList = ({ 
  contacts, 
  onDelete, 
  onUpdate,
  onImport,
  isDeleting, 
  isUpdating,
  isImporting 
}: ContactListProps) => {
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [notesContact, setNotesContact] = useState<Contact | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const search = searchTerm.toLowerCase();
    return (
      contact.name.toLowerCase().includes(search) ||
      contact.email.toLowerCase().includes(search) ||
      contact.phone.toLowerCase().includes(search)
    );
  });

  const sortedContacts = [...filteredContacts].sort((a, b) => {
    let comparison = 0;
    if (sortField === "name") {
      comparison = a.name.localeCompare(b.name);
    } else if (sortField === "email") {
      comparison = a.email.localeCompare(b.email);
    } else if (sortField === "created_at") {
      comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 hover:bg-muted"
      onClick={() => handleSort(field)}
    >
      {children}
      <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
    </Button>
  );

  return (
    <>
      <Card className="shadow-card animate-fade-in">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Contact List</CardTitle>
                <CardDescription>
                  {contacts.length === 0 
                    ? "No contacts yet. Add your first contact!" 
                    : `${filteredContacts.length} of ${contacts.length} contact${contacts.length === 1 ? "" : "s"}`}
                </CardDescription>
              </div>
            </div>
            <ImportExportButtons 
              contacts={contacts} 
              onImport={onImport}
              isImporting={isImporting}
            />
          </div>
          <div className="mt-4">
            <SearchFilter searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          </div>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-1 text-lg font-medium">No contacts yet</h3>
              <p className="text-sm text-muted-foreground">
                Start by adding your first contact using the form
              </p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h3 className="mb-1 text-lg font-medium">No matches found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search term
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[160px]">
                      <SortButton field="name">Name</SortButton>
                    </TableHead>
                    <TableHead className="w-[200px]">
                      <SortButton field="email">Email</SortButton>
                    </TableHead>
                    <TableHead className="w-[130px]">Phone</TableHead>
                    <TableHead className="hidden md:table-cell">Message</TableHead>
                    <TableHead className="w-[100px]">
                      <SortButton field="created_at">Date</SortButton>
                    </TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedContacts.map((contact, index) => (
                    <TableRow 
                      key={contact.id} 
                      className="animate-slide-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={contact.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {contact.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || <User className="h-3 w-3" />}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{contact.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <a 
                          href={`mailto:${contact.email}`} 
                          className="flex items-center gap-1.5 text-primary hover:underline"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          <span className="truncate max-w-[150px]">{contact.email}</span>
                        </a>
                      </TableCell>
                      <TableCell>
                        <a 
                          href={`tel:${contact.phone}`} 
                          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          {contact.phone}
                        </a>
                      </TableCell>
                      <TableCell className="hidden md:table-cell max-w-[180px]">
                        {contact.message ? (
                          <span className="flex items-start gap-1.5 text-sm text-muted-foreground">
                            <MessageSquare className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                            <span className="truncate">{contact.message}</span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(contact.created_at), "MMM d")}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                            onClick={() => setNotesContact(contact)}
                            title="Notes"
                          >
                            <StickyNote className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                            onClick={() => setEditingContact(contact)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => onDelete(contact.id)}
                            disabled={isDeleting === contact.id}
                            title="Delete"
                          >
                            {isDeleting === contact.id ? (
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <EditContactDialog
        contact={editingContact}
        open={!!editingContact}
        onOpenChange={(open) => !open && setEditingContact(null)}
        onSave={onUpdate}
        isLoading={isUpdating}
      />

      {notesContact && (
        <ContactNotesDialog
          contactId={notesContact.id}
          contactName={notesContact.name}
          open={!!notesContact}
          onOpenChange={(open) => !open && setNotesContact(null)}
        />
      )}
    </>
  );
};
