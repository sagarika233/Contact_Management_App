import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, UserPlus, Pencil, Trash2, FileDown, Upload, FolderPlus } from "lucide-react";
import { useActivityLog } from "@/hooks/useActivityLog";

const actionIcons: Record<string, React.ReactNode> = {
  created: <UserPlus className="h-4 w-4 text-green-500" />,
  updated: <Pencil className="h-4 w-4 text-blue-500" />,
  deleted: <Trash2 className="h-4 w-4 text-red-500" />,
  imported: <Upload className="h-4 w-4 text-purple-500" />,
  exported: <FileDown className="h-4 w-4 text-orange-500" />,
  group_changed: <FolderPlus className="h-4 w-4 text-indigo-500" />,
};

interface ActivityLogPanelProps {
  contactId?: string;
}

export const ActivityLogPanel = ({ contactId }: ActivityLogPanelProps) => {
  const { activities, isLoading } = useActivityLog(contactId);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4" />
          Activity Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <Activity className="mb-2 h-8 w-8" />
              <p className="text-sm">No activity yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 text-sm">
                  <div className="mt-0.5">
                    {actionIcons[activity.action] || <Activity className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium capitalize">{activity.action.replace("_", " ")}</p>
                    {activity.details && (
                      <p className="text-muted-foreground truncate text-xs">
                        {typeof activity.details === 'object' && 'name' in activity.details 
                          ? String(activity.details.name) 
                          : JSON.stringify(activity.details)}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(activity.created_at), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};