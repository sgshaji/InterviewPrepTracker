import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface InlineEditCellProps {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
}

export default function InlineEditCell({ 
  value, 
  onSave, 
  placeholder = "Click to edit", 
  className,
  multiline = false 
}: InlineEditCellProps) {
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
    if (!isEditing) {
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
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className="h-auto py-1 px-2 text-sm border-primary"
      />
    );
  }

  return (
    <div
      className={cn(
        "cursor-pointer hover:bg-slate-100 rounded px-2 py-1 transition-colors min-h-[1.5rem] flex items-center",
        !value && "text-slate-400",
        className
      )}
      onClick={handleClick}
    >
      {value || placeholder}
    </div>
  );
}
