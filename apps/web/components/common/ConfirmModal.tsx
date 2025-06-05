import { Button } from "../ui/button";

function ConfirmModal({
  open,
  query,
  onConfirm,
  onCancel
}: {
  open: boolean;
  query: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
        <h2 className="text-lg font-bold mb-2">Confirmation Required</h2>
        <div className="mb-4">
          <div className="mb-2">You are about to run this query/command:</div>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
            {query}
          </pre>
          <div className="mt-2 text-red-600">
            This operation may modify or delete data. Are you sure?
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Yes
          </Button>
        </div>
      </div>
    </div>
  );
}
export default ConfirmModal;