import { useAppStore } from "../../store/useAppStore";
import { AddMemoryModal } from "./AddMemoryModal";

/**
 * App-wide Add Memory modal driven by the store: any component can call
 * `openAddMemory(destinationId)` to open it with that destination preselected
 * (pass "" for no preselection). Mount exactly once, e.g. in AppLayout.
 */
export function GlobalAddMemoryModal() {
  const destinationId = useAppStore((s) => s.addMemoryForDestinationId);
  const openAddMemory = useAppStore((s) => s.openAddMemory);
  return (
    <AddMemoryModal
      open={destinationId !== null}
      defaultDestinationId={destinationId || undefined}
      onClose={() => openAddMemory(null)}
    />
  );
}
