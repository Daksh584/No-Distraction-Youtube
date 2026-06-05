"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface SidePanelProps {
  children: React.ReactNode;
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

const MIN_WIDTH = 360;
const MAX_WIDTH_RATIO = 0.85;
const DEFAULT_WIDTH = 520;

export default function SidePanel({
  children,
  title,
  icon,
  isOpen,
  onClose,
}: SidePanelProps) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const isDragging = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const maxWidth = window.innerWidth * MAX_WIDTH_RATIO;
      const newWidth = Math.max(MIN_WIDTH, Math.min(maxWidth, window.innerWidth - e.clientX));
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 h-full z-50 transition-transform duration-500 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ width: `${width}px`, maxWidth: "92vw" }}
      >
        {/* Resize Handle */}
        <div
          onMouseDown={handleMouseDown}
          className="absolute left-0 top-0 h-full w-2 cursor-col-resize z-10 group flex items-center"
          title="Drag to resize"
        >
          {/* Visual indicator */}
          <div className="absolute inset-y-0 left-0 w-1 bg-transparent group-hover:bg-primary-500/40 transition-colors duration-200" />
          <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-4 h-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex flex-col gap-1">
              <div className="w-0.5 h-1.5 rounded-full bg-primary-500/60" />
              <div className="w-0.5 h-1.5 rounded-full bg-primary-500/60" />
              <div className="w-0.5 h-1.5 rounded-full bg-primary-500/60" />
            </div>
          </div>
        </div>

        <div className="h-full bg-base-100 shadow-2xl border-l border-base-content/10 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-base-content/10">
            <div className="flex items-center gap-2">
              {icon}
              <h3 className="font-poppins font-bold text-lg gradient-text">
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="btn btn-sm btn-ghost btn-circle hover:bg-base-200 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">{children}</div>
        </div>
      </div>
    </>
  );
}
