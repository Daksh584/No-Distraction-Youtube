import React from "react";

interface ExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExtensionModal({ isOpen, onClose }: ExtensionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-lg bg-base-100 rounded-[2rem] shadow-2xl overflow-hidden border border-base-content/10 animate-scale-in">
        {/* Decorative Top Gradient */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500" />

        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center text-primary-500 border border-primary-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold font-poppins text-base-content leading-tight">
                  Chrome Extension
                </h2>
                <p className="text-sm font-medium text-success">
                  100% Safe & Open Source
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-circle btn-sm text-base-content/50 hover:text-base-content"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <p className="text-base-content/80 font-medium mb-6">
            Get the ultimate experience! The EduTube extension seamlessly redirects you from regular YouTube straight into our distraction-free player.
          </p>

          <div className="bg-base-200/50 rounded-2xl p-5 mb-8 border border-base-content/5">
            <h3 className="font-semibold text-base-content mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Installation Instructions
            </h3>
            <ol className="list-decimal list-inside space-y-3 text-sm text-base-content/70 font-medium">
              <li>
                Download the <a href="https://github.com/Daksh584/No-Distraction-Youtube/tree/main/Extension" target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline font-bold">Extension Folder</a> from GitHub.
              </li>
              <li>
                Open Chrome and go to <code className="bg-base-300 px-2 py-0.5 rounded text-secondary-500">chrome://extensions/</code>
              </li>
              <li>
                Turn on <strong className="text-base-content">Developer mode</strong> in the top right corner.
              </li>
              <li>
                Click <strong className="text-base-content">Load unpacked</strong> and select the folder you downloaded.
              </li>
            </ol>
            
            <div className="mt-4 p-3 bg-primary-500/10 rounded-xl border border-primary-500/20 text-xs text-primary-500/80 font-medium flex gap-2 items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Disclaimer: This extension is completely safe, open source, and only injects a small button into YouTube to redirect you here. It does not track any data.</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="https://drive.google.com/drive/folders/18O2gwEY3pv1DNAc12uBQMhsPZJU8Hnns?usp=drive_link"
              target="_blank"
              rel="noopener noreferrer"
              className="btn flex-1 gradient-primary text-white rounded-xl shadow-lg shadow-primary-500/30 hover:-translate-y-0.5 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download ZIP
            </a>
            <a
              href="https://github.com/Daksh584/No-Distraction-Youtube/tree/main/Extension"
              target="_blank"
              rel="noopener noreferrer"
              className="btn flex-1 bg-base-200 border-base-content/10 hover:bg-base-300 rounded-xl"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              View Source
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
