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
    <Card className="border-white/[0.06] shadow-glass-sm hover:shadow-glass hover:bg-white/[0.06] transition-all duration-300 group cursor-default">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between space-y-4 sm:space-y-0">
          <div className="space-y-2">
            <p className="text-xs text-white/50 font-medium tracking-wide uppercase">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
            {(description || trend) && (
              <p className="text-xs text-white/40">{description || trend}</p>
            )}
          </div>
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#00FF88] to-[#00CC70] flex items-center justify-center text-[#0B1220] shadow-lg shadow-[#00FF88]/20 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
