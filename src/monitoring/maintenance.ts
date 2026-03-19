/**
 * Equipment maintenance tracking for tide pool monitoring
 * stations. Manages work orders, preventive maintenance
 * schedules, and repair histories for field instruments.
 */

export type MaintenanceType = "preventive" | "corrective" | "emergency" | "inspection";
export type MaintenancePriority = "low" | "medium" | "high" | "critical";
export type WorkOrderStatus = "open" | "in_progress" | "completed" | "cancelled";

export interface WorkOrder {
  readonly id: string;
  readonly equipmentId: string;
  readonly type: MaintenanceType;
  readonly priority: MaintenancePriority;
  readonly description: string;
  status: WorkOrderStatus;
  readonly createdAt: Date;
  completedAt: Date | null;
}

export interface MaintenanceLog {
  readonly equipmentId: string;
  readonly orders: WorkOrder[];
  readonly totalDowntimeHours: number;
}

export function createWorkOrder(
  equipmentId: string,
  type: MaintenanceType,
  priority: MaintenancePriority,
  description: string
): WorkOrder {
  return {
    id: `wo_${equipmentId}_${Date.now()}`,
    equipmentId,
    type,
    priority,
    description,
    status: "open",
    createdAt: new Date(),
    completedAt: null,
  };
}

export function completeWorkOrder(order: WorkOrder): WorkOrder {
  return {
    ...order,
    status: "completed",
    completedAt: new Date(),
  };
}

export function cancelWorkOrder(order: WorkOrder): WorkOrder {
  return {
    ...order,
    status: "cancelled",
    completedAt: new Date(),
  };
}

export function filterByStatus(
  orders: WorkOrder[],
  status: WorkOrderStatus
): WorkOrder[] {
  return orders.filter((o) => o.status === status);
}

export function filterByPriority(
  orders: WorkOrder[],
  priority: MaintenancePriority
): WorkOrder[] {
  return orders.filter((o) => o.priority === priority);
}

export function openOrderCount(orders: WorkOrder[]): number {
  return orders.filter((o) => o.status === "open" || o.status === "in_progress").length;
}

export function completionRate(orders: WorkOrder[]): number {
  if (orders.length === 0) return 0;
  const completed = orders.filter((o) => o.status === "completed").length;
  return Math.round((completed / orders.length) * 10000) / 100;
}

export function averageResolutionTime(orders: WorkOrder[]): number {
  const completed = orders.filter((o) => o.status === "completed" && o.completedAt);
  if (completed.length === 0) return 0;
  const totalMs = completed.reduce((sum, o) => {
    const elapsed = (o.completedAt as Date).getTime() - o.createdAt.getTime();
    return sum + elapsed;
  }, 0);
  return Math.round(totalMs / completed.length / 3600000 * 100) / 100;
}

export function buildMaintenanceLog(
  equipmentId: string,
  orders: WorkOrder[]
): MaintenanceLog {
  const equipmentOrders = orders.filter((o) => o.equipmentId === equipmentId);
  let downtime = 0;
  for (const o of equipmentOrders) {
    if (o.status === "completed" && o.completedAt) {
      const hours = (o.completedAt.getTime() - o.createdAt.getTime()) / 3600000;
      downtime += hours;
    }
  }
  return {
    equipmentId,
    orders: equipmentOrders,
    totalDowntimeHours: Math.round(downtime * 100) / 100,
  };
}

export function priorityScore(priority: MaintenancePriority): number {
  switch (priority) {
    case "critical": return 4;
    case "high": return 3;
    case "medium": return 2;
    case "low": return 1;
  }
}

export function sortByPriority(orders: WorkOrder[]): WorkOrder[] {
  return [...orders].sort(
    (a, b) => priorityScore(b.priority) - priorityScore(a.priority)
  );
}
