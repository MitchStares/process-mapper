import React from 'react';

interface ContextMenuProps {
  x: number;
  y: number;
  onDuplicate: () => void;
  onDelete: () => void;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  canDuplicate: boolean;
  canDelete: boolean;
  canCopy: boolean;
  canPaste: boolean;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  onDuplicate,
  onDelete,
  onCopy,
  onCut,
  onPaste,
  canDuplicate,
  canDelete,
  canCopy,
  canPaste,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: y,
        left: x,
        zIndex: 1000,
      }}
      className="bg-white border rounded shadow-md p-2"
    >
      <button
        className="block w-full text-left px-4 py-2 hover:bg-gray-100 disabled:text-gray-400 disabled:hover:bg-white"
        onClick={onDuplicate}
        disabled={!canDuplicate}
      >
        Duplicate
      </button>
      <button
        className="block w-full text-left px-4 py-2 hover:bg-gray-100 disabled:text-gray-400 disabled:hover:bg-white"
        onClick={onDelete}
        disabled={!canDelete}
      >
        Delete
      </button>
      <button
        className="block w-full text-left px-4 py-2 hover:bg-gray-100 disabled:text-gray-400 disabled:hover:bg-white"
        onClick={onCopy}
        disabled={!canCopy}
      >
        Copy
      </button>
      <button
        className="block w-full text-left px-4 py-2 hover:bg-gray-100 disabled:text-gray-400 disabled:hover:bg-white"
        onClick={onCut}
        disabled={!canCopy}
      >
        Cut
      </button>
      <button
        className="block w-full text-left px-4 py-2 hover:bg-gray-100 disabled:text-gray-400 disabled:hover:bg-white"
        onClick={onPaste}
        disabled={!canPaste}
      >
        Paste
      </button>
    </div>
  );
};

export default ContextMenu;
