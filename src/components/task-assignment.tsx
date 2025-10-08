"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

import { Task } from "@/types/task";

interface TaskAssignmentProps {
  assignedTasks: Task[];
  availableTasks: Task[];
  onAssignTask: (taskId: string) => void;
  onUnassignTask: (taskId: string) => void;
}

export function TaskAssignment({
  assignedTasks,
  availableTasks,
  onAssignTask,
  onUnassignTask,
}: TaskAssignmentProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Tâches disponibles</CardTitle>
          <CardDescription>
            Sélectionnez les tâches à assigner au plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[150px] pr-4">
            <div className="space-y-2">
              {availableTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{task.title}</p>
                    {task.role && (
                      <p className="text-xs text-blue-600">
                        Rôle : {task.role}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {task.description}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAssignTask(task.id)}
                  >
                    Assigner
                  </Button>
                </div>
              ))}
              {availableTasks.length === 0 && (
                <p className="text-center text-muted-foreground">
                  Aucune tâche disponible
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tâches assignées</CardTitle>
          <CardDescription>
            Les tâches actuellement assignées au plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[150px] pr-4">
            <div className="space-y-2">
              {assignedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{task.title}</p>
                    {task.role && (
                      <p className="text-xs text-blue-600">
                        Rôle : {task.role}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {task.description}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUnassignTask(task.id)}
                  >
                    Retirer
                  </Button>
                </div>
              ))}
              {assignedTasks.length === 0 && (
                <p className="text-center text-muted-foreground">
                  Aucune tâche assignée
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
