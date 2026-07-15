import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const levels = [
  "bg-[#edf6f0] dark:bg-[#2a352f]",
  "bg-[#dbeee3] dark:bg-[#365246]",
  "bg-[#c1dfce] dark:bg-[#487060]",
  "bg-[#a8caba] dark:bg-[#5e8d79]",
  "bg-[#84b39a] dark:bg-[#78ab90]"
];

function resolveLevel(ratio: number) {
  if (ratio <= 0) return 0;
  if (ratio < 0.25) return 1;
  if (ratio < 0.5) return 2;
  if (ratio < 0.95) return 3;
  return 4;
}

export function WeeklyHeatmap({
  data,
  onSelectDate,
  selectedKey
}: {
  data: Array<{ key: string; ratio: number; label: string; rest?: boolean }>;
  onSelectDate?: (key: string) => void;
  selectedKey?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>本周绽放热力图</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {data.map((item) => {
            const selected = selectedKey === item.key;
            const cell = (
              <div
                className={cn(
                  "h-10 rounded-2xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]",
                  item.rest
                    ? "border-dashed border-[#c4b8d8]/80 bg-[repeating-linear-gradient(-45deg,#efe8f8,#efe8f8_4px,#e4d9f0_4px,#e4d9f0_8px)] dark:border-[#6a5d7d] dark:bg-[repeating-linear-gradient(-45deg,#2a2433,#2a2433_4px,#322b3d_4px,#322b3d_8px)]"
                    : `${levels[resolveLevel(item.ratio)]} ${selected ? "border-[#84b39a] ring-2 ring-[#a8caba]/70" : "border-white/50"}`,
                  selected && item.rest && "ring-2 ring-[#b9a8d4]/70"
                )}
                title={
                  item.rest
                    ? `${item.key} 休息日`
                    : `${item.key} 完成度 ${Math.round(item.ratio * 100)}%`
                }
              />
            );

            return (
              <div key={item.key} className="space-y-2 text-center">
                {onSelectDate ? (
                  <button
                    type="button"
                    className="w-full"
                    onClick={() => onSelectDate(item.key)}
                    aria-label={`查看 ${item.key}`}
                  >
                    {cell}
                  </button>
                ) : (
                  cell
                )}
                <p className="text-[11px] text-[#7b8f84] dark:text-[#9cb0a5]">{item.label}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
