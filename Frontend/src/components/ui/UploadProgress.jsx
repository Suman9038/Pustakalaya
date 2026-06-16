import { useEffect, useState } from 'react';
import { CloudUpload, FileText, BrainCircuit, Sparkles, CheckCircle2 } from 'lucide-react';

export default function UploadProgress({ isUploading }) {
  const [step, setStep] = useState(0);

  const steps = [
    { icon: <CloudUpload size={24} />, title: "Uploading to Cloud", desc: "Securely transferring your book file..." },
    { icon: <FileText size={24} />, title: "Extracting Content", desc: "Reading text and metadata..." },
    { icon: <BrainCircuit size={24} />, title: "Generating AI Vectors", desc: "Creating embeddings for smart search..." },
    { icon: <Sparkles size={24} />, title: "Finalizing Library", desc: "Almost ready to chat!" }
  ];

  useEffect(() => {
    if (!isUploading) {
      setStep(0);
      return;
    }

    // Simulate progress through the steps while uploading
    const intervals = [
      setTimeout(() => setStep(1), 2000), // Move to step 2 after 2s
      setTimeout(() => setStep(2), 5000), // Move to step 3 after 5s
      setTimeout(() => setStep(3), 9000), // Move to step 4 after 9s
    ];

    return () => intervals.forEach(clearTimeout);
  }, [isUploading]);

  if (!isUploading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md" style={{ background: 'rgba(0, 0, 0, 0.7)' }}>
      <div 
        className="w-full max-w-md p-8 rounded-3xl relative overflow-hidden flex flex-col items-center text-center transform transition-all"
        style={{ 
          background: 'var(--color-card)', 
          border: '1px solid rgba(245, 158, 11, 0.3)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 40px rgba(245, 158, 11, 0.1)'
        }}
      >
        {/* Animated Background Gradient */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none" 
          style={{ 
            background: 'radial-gradient(circle at 50% 0%, var(--color-amber) 0%, transparent 70%)',
            animation: 'pulse 3s infinite alternate'
          }} 
        />

        <div className="relative z-10 w-full">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center animate-bounce shadow-lg shadow-amber-500/20" style={{ background: 'var(--color-amber-ghost)', color: 'var(--color-amber)' }}>
            {steps[step].icon}
          </div>

          <h2 className="font-display text-2xl mb-2" style={{ color: 'var(--color-text-1)' }}>
            {steps[step].title}
          </h2>
          <p className="font-sans text-sm mb-8 h-5" style={{ color: 'var(--color-text-2)' }}>
            {steps[step].desc}
          </p>

          <div className="w-full space-y-4">
            {steps.map((s, idx) => {
              const isActive = idx === step;
              const isPast = idx < step;
              
              return (
                <div key={idx} className="flex items-center gap-4 transition-all duration-500" style={{ opacity: isActive || isPast ? 1 : 0.4, transform: isActive ? 'scale(1.02)' : 'scale(1)' }}>
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors duration-500"
                    style={{ 
                      background: isPast ? 'var(--color-amber)' : (isActive ? 'var(--color-amber-ghost)' : 'var(--color-base)'),
                      color: isPast ? 'var(--color-void)' : (isActive ? 'var(--color-amber)' : 'var(--color-text-3)'),
                      border: `1px solid ${isPast || isActive ? 'var(--color-amber)' : 'var(--border-subtle)'}`
                    }}
                  >
                    {isPast ? <CheckCircle2 size={16} /> : <span className="text-xs font-bold">{idx + 1}</span>}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-sans text-sm font-medium transition-colors" style={{ color: isActive || isPast ? 'var(--color-text-1)' : 'var(--color-text-3)' }}>
                      {s.title}
                    </p>
                  </div>
                  {isActive && (
                    <div className="w-4 h-4 border-2 border-[color:var(--color-amber)] border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Overall Progress Bar */}
          <div className="w-full h-1.5 mt-8 rounded-full overflow-hidden" style={{ background: 'var(--color-base)' }}>
            <div 
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{ 
                width: `${((step + 1) / steps.length) * 100}%`,
                background: 'linear-gradient(90deg, var(--color-amber), #fcd34d)',
                boxShadow: '0 0 10px rgba(245, 158, 11, 0.5)'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
