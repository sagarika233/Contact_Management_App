import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  message?: string | null;
  created_at: string;
}

interface ImportExportButtonsProps {
  contacts: Contact[];
  onImport: (contacts: { name: string; email: string; phone: string; message?: string }[]) => Promise<void>;
  isImporting: boolean;
}

export const ImportExportButtons = ({ contacts, onImport, isImporting }: ImportExportButtonsProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportToCSV = () => {
    if (contacts.length === 0) {
      toast({
        title: "No contacts",
        description: "Add some contacts before exporting.",
        variant: "destructive",
      });
      return;
    }

    const headers = ["Name", "Email", "Phone", "Message", "Created At"];
    const csvRows = [
      headers.join(","),
      ...contacts.map((contact) =>
        [
          `"${contact.name.replace(/"/g, '""')}"`,
          `"${contact.email.replace(/"/g, '""')}"`,
          `"${contact.phone.replace(/"/g, '""')}"`,
          `"${(contact.message || "").replace(/"/g, '""')}"`,
          `"${contact.created_at}"`,
        ].join(",")
      ),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `contacts_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    toast({
      title: "Export Complete",
      description: `${contacts.length} contacts exported successfully.`,
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast({
        title: "Invalid File",
        description: "Please select a CSV file.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split("\n").filter((line) => line.trim());
        
        if (lines.length < 2) {
          toast({
            title: "Empty File",
            description: "The CSV file doesn't contain any data.",
            variant: "destructive",
          });
          return;
        }

        // Skip header row
        const dataLines = lines.slice(1);
        const contacts: { name: string; email: string; phone: string; message?: string }[] = [];

        for (const line of dataLines) {
          // Parse CSV line handling quoted values
          const values: string[] = [];
          let current = "";
          let inQuotes = false;

          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === "," && !inQuotes) {
              values.push(current.trim());
              current = "";
            } else {
              current += char;
            }
          }
          values.push(current.trim());

          if (values[0] && values[1] && values[2]) {
            contacts.push({
              name: values[0],
              email: values[1],
              phone: values[2],
              message: values[3] || undefined,
            });
          }
        }

        if (contacts.length === 0) {
          toast({
            title: "No Valid Contacts",
            description: "Could not parse any valid contacts from the file.",
            variant: "destructive",
          });
          return;
        }

        await onImport(contacts);
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Failed to parse the CSV file. Please check the format.",
          variant: "destructive",
        });
      }
    };

    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
      >
        {isImporting ? (
          <>
            <span className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Importing...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-3.5 w-3.5" />
            Import CSV
          </>
        )}
      </Button>
      <Button variant="outline" size="sm" onClick={exportToCSV}>
        <Download className="mr-2 h-3.5 w-3.5" />
        Export CSV
      </Button>
    </div>
  );
};
