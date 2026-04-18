import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function StatCard({
  icon,
  title,
  value,
  description,
  color,
  trend,
}) {
  return (
    <Card className="border-slate-200 shadow-sm bg-gradient-to-br">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between space-y-4 sm:space-y-0">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {(description || trend) && (
              <p className="text-xs text-muted-foreground">
                {description || trend}
              </p>
            )}
          </div>
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
