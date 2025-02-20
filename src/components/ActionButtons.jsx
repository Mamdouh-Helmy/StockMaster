// components/ActionButtons.jsx
import React from "react";
import { Pencil, Trash } from "lucide-react";

export default function ActionButtons({ onEdit, onDelete }) {
  return (
    <div className="flex items-center justify-center">
      <button
        onClick={onEdit}
        className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition"
      >
        <Pencil size={18} />
      </button>
      <button
        onClick={onDelete}
        className="bg-red-500 mr-2 text-white p-2 rounded-lg hover:bg-red-600 transition"
      >
        <Trash size={18} />
      </button>
    </div>
  );
}