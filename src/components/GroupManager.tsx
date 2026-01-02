import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FolderPlus, Trash2, Tags, Plus } from "lucide-react";
import { useContactGroups, ContactGroup } from "@/hooks/useContactGroups";

const GROUP_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316", 
  "#eab308", "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6"
];

interface GroupManagerProps {
  selectedGroupId?: string | null;
  onGroupSelect: (groupId: string | null) => void;
}

export const GroupManager = ({ selectedGroupId, onGroupSelect }: GroupManagerProps) => {
  const { groups, addGroup, deleteGroup } = useContactGroups();
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedColor, setSelectedColor] = useState(GROUP_COLORS[0]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddGroup = async () => {
    if (!newGroupName.trim()) return;
    await addGroup(newGroupName.trim(), selectedColor);
    setNewGroupName("");
    setSelectedColor(GROUP_COLORS[0]);
    setDialogOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge
        variant={selectedGroupId === null ? "default" : "outline"}
        className="cursor-pointer hover:bg-primary/80"
        onClick={() => onGroupSelect(null)}
      >
        All Contacts
      </Badge>
      {groups.map((group) => (
        <Badge
          key={group.id}
          variant={selectedGroupId === group.id ? "default" : "outline"}
          className="cursor-pointer gap-1 pr-1"
          style={{ 
            backgroundColor: selectedGroupId === group.id ? group.color : "transparent",
            borderColor: group.color,
            color: selectedGroupId === group.id ? "#fff" : group.color
          }}
          onClick={() => onGroupSelect(group.id)}
        >
          {group.name}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={(e) => {
              e.stopPropagation();
              deleteGroup(group.id);
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-6 gap-1">
            <Plus className="h-3 w-3" />
            Add Group
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="h-5 w-5" />
              Create Group
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Group name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddGroup()}
            />
            <div className="flex flex-wrap gap-2">
              {GROUP_COLORS.map((color) => (
                <button
                  key={color}
                  className={`h-8 w-8 rounded-full border-2 transition-transform ${
                    selectedColor === color ? "scale-110 border-foreground" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
            <Button onClick={handleAddGroup} className="w-full" disabled={!newGroupName.trim()}>
              Create Group
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};