import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface NotionCellProps {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  className?: string;
  type?: "text" | "date" | "select";
  options?: readonly string[];
}

export default function NotionCell({ 
  value, 
  onSave, 
  placeholder = "Empty", 
  className,
  type = "text",
  options = []
}: NotionCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleClick = () => {
    if (!isEditing && type !== "select") {
      setIsEditing(true);
      setEditValue(value);
    }
  };

  const handleSave = () => {
    if (editValue !== value) {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    } else if (e.key === "Tab") {
      handleSave();
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  if (type === "select") {
    return (
      <Select value={value} onValueChange={onSave}>
        <SelectTrigger className="h-8 border-0 bg-transparent hover:bg-slate-50 focus:bg-white focus:border-slate-200">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type={type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className="h-8 border-0 bg-white border-slate-200 focus:border-primary"
      />
    );
  }

  return (
    <div
      className={cn(
        "h-8 px-3 py-1 cursor-text hover:bg-slate-50 rounded-sm transition-colors flex items-center text-sm",
        !value && "text-slate-400",
        className
      )}
      onClick={handleClick}
    >
      {value || placeholder}
    </div>
  );
}