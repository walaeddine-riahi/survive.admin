import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
  dependencies: string[]; // IDs des tâches dont celle-ci dépend
  role?: string;
}

interface Plan {
  id: string;
  name: string;
  tasks: Task[];
}

interface TaskPlanProps {
  simulationId: string;
  onPlanUpdate?: (plan: Plan) => void;
}

export function TaskPlan({ simulationId, onPlanUpdate }: TaskPlanProps) {
  const [plan, setPlan] = useState<Plan>({
    id: "1",
    name: "Plan de simulation",
    tasks: [],
  });

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    role: "",
  });

  const addTask = () => {
    if (!newTask.title) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      status: "pending",
      dependencies: [],
      role: newTask.role,
    };

    setPlan((prev) => ({
      ...prev,
      tasks: [...prev.tasks, task],
    }));

    setNewTask({ title: "", description: "", role: "" });
    onPlanUpdate?.(plan);
  };

  const removeTask = (taskId: string) => {
    setPlan((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => task.id !== taskId),
    }));
    onPlanUpdate?.(plan);
  };

  const addDependency = (taskId: string, dependencyId: string) => {
    setPlan((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === taskId
          ? { ...task, dependencies: [...task.dependencies, dependencyId] }
          : task
      ),
    }));
    onPlanUpdate?.(plan);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Plan des tâches</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Titre de la tâche"
              value={newTask.title}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, title: e.target.value }))
              }
            />
            <Input
              placeholder="Description"
              value={newTask.description}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, description: e.target.value }))
              }
            />
            <Input
              placeholder="Rôle"
              value={newTask.role}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, role: e.target.value }))
              }
            />
            <Button onClick={addTask}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>

          <div className="space-y-2">
            {plan.tasks.map((task) => (
              <Card key={task.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{task.title}</h3>
                    <p className="text-sm text-gray-500">{task.description}</p>
                    {task.dependencies.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Dépend de:</p>
                        <ul className="text-sm text-gray-500">
                          {task.dependencies.map((depId) => {
                            const depTask = plan.tasks.find(
                              (t) => t.id === depId
                            );
                            return (
                              <li key={depId}>
                                {depTask?.title || "Tâche inconnue"}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                    {task.role && (
                      <p className="text-xs text-blue-600">
                        Rôle : {task.role}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTask(task.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
