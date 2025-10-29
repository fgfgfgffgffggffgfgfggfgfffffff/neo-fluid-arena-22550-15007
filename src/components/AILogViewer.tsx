import { ScrollArea } from "./ui/scroll-area";
import { Card } from "./ui/card";
import { Terminal } from "lucide-react";

interface AILogEntry {
  timestamp: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
}

interface AILogViewerProps {
  logs: AILogEntry[];
}

export const AILogViewer = ({ logs }: AILogViewerProps) => {
  const getColor = (type: string) => {
    switch (type) {
      case "success": return "text-green-400";
      case "warning": return "text-yellow-400";
      case "error": return "text-red-400";
      default: return "text-cyan-400";
    }
  };

  const formatLogAsCode = (log: AILogEntry) => {
    // Format as code-like output with syntax highlighting
    const parts = log.message.split(/(\w+:|\d+|AI\s+\w+|Lv\d+|\d+\.\d+px)/g);
    return parts.map((part, i) => {
      if (/^AI\s+\w+$/.test(part)) {
        return <span key={i} className="text-purple-400 font-bold">{part}</span>;
      } else if (/^Lv\d+$/.test(part)) {
        return <span key={i} className="text-yellow-400">{part}</span>;
      } else if (/^\d+$/.test(part)) {
        return <span key={i} className="text-blue-400">{part}</span>;
      } else if (/^\d+\.\d+px$/.test(part)) {
        return <span key={i} className="text-green-400">{part}</span>;
      } else if (/\w+:$/.test(part)) {
        return <span key={i} className="text-orange-400">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <Card className="fixed bottom-4 right-4 w-[450px] bg-black/95 backdrop-blur-sm border-cyan-500/30 font-mono">
      <div className="p-2 border-b border-cyan-500/30 flex items-center gap-2">
        <Terminal className="w-4 h-4 text-cyan-400" />
        <h3 className="text-xs font-bold text-cyan-400 tracking-wider">AI_SYSTEM.LOG</h3>
        <div className="ml-auto flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <div className="text-[10px] text-green-400">ACTIVE</div>
        </div>
      </div>
      <ScrollArea className="h-64">
        <div className="p-2 space-y-1">
          {logs.map((log, index) => (
            <div key={index} className="text-[10px] leading-relaxed hover:bg-cyan-500/5 px-1 rounded transition-colors">
              <span className="text-cyan-600">[{log.timestamp}]</span>
              {" "}
              <span className={`${getColor(log.type)} font-bold`}>
                {log.type === "error" && "ERR"}
                {log.type === "warning" && "WARN"}
                {log.type === "success" && "OK"}
                {log.type === "info" && "INFO"}
              </span>
              {" "}
              <span className="text-foreground/80">
                {formatLogAsCode(log)}
              </span>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-center text-cyan-600/40 text-xs py-8 font-mono">
              <div className="animate-pulse">&gt; System initializing...</div>
              <div className="mt-2 text-[10px]">Waiting for AI activity</div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-2 border-t border-cyan-500/30 text-[10px] text-cyan-600 flex justify-between">
        <span>Lines: {logs.length}</span>
        <span>Buffer: OK</span>
      </div>
    </Card>
  );
};
