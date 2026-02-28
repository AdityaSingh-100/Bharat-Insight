"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./dialog";
import { Button } from "./button";
import { Save } from "lucide-react";

interface EditRowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: Record<string, unknown> | null;
  onSave: (updated: Record<string, unknown>) => void;
}

export function EditRowModal({
  open,
  onOpenChange,
  row,
  onSave,
}: EditRowModalProps) {
  const [fields, setFields] = useState<Record<string, string>>({});

  useEffect(() => {
    if (row) {
      setFields(
        Object.fromEntries(
          Object.entries(row).map(([k, v]) => [k, String(v ?? "")]),
        ),
      );
    }
  }, [row]);

  if (!row) return null;

  const keys = Object.keys(row).slice(0, 12); // show up to 12 fields

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Row</DialogTitle>
          <DialogDescription>
            Modify the values below. Changes apply to the current session only.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 mt-2 max-h-72 overflow-y-auto pr-1">
          {keys.map((key) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-[10px] font-medium uppercase tracking-wider text-white/40">
                {key}
              </label>
              <input
                type="text"
                value={fields[key] ?? ""}
                onChange={(e) =>
                  setFields((prev) => ({ ...prev, [key]: e.target.value }))
                }
                className="bg-white/5 border border-[var(--color-border)] rounded-md px-2.5 py-1.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[var(--color-org-primary)] transition-colors"
              />
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              const updated: Record<string, unknown> = { ...row };
              for (const [k, v] of Object.entries(fields)) {
                const orig = row[k];
                // Preserve numeric types
                if (typeof orig === "number") {
                  const n = parseFloat(v);
                  updated[k] = isNaN(n) ? v : n;
                } else {
                  updated[k] = v;
                }
              }
              onSave(updated);
              onOpenChange(false);
            }}
          >
            <Save size={13} className="mr-1.5" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
