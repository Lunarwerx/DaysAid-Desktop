import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const { signInWithOtp, verifyOtp } = useAuth();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSendOtp = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError('');

    const { error } = await signInWithOtp(email);
    
    setLoading(false);
    
    if (error) {
      setError(error.message);
    } else {
      setStep('otp');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      setError('Please enter the code from your email');
      return;
    }

    setLoading(true);
    setError('');

    const { error } = await verifyOtp(email, otp.trim());
    
    setLoading(false);
    
    if (error) {
      setError(error.message);
    } else {
      // Success - close modal
      handleClose();
    }
  };

  const handleClose = () => {
    setEmail('');
    setOtp('');
    setStep('email');
    setError('');
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-[var(--bg-card)] rounded-2xl shadow-xl p-8 w-full max-w-sm text-center transition-colors duration-300">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Sign In</h2>
        <p className="text-[var(--text-secondary)] mb-6">Sync your notes across all devices</p>

        {step === 'email' ? (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] rounded-lg mb-3 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
              autoFocus
            />
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Access Code'}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-[var(--text-secondary)] mb-4">Enter the code sent to {email}</p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="000000"
              maxLength={8}
              className="w-full px-4 py-3 border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] rounded-lg mb-3 text-2xl text-center font-mono font-bold tracking-widest focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
              autoFocus
            />
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed mb-2"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
            <button
              onClick={() => {
                setStep('email');
                setOtp('');
                setError('');
              }}
              className="w-full py-3 bg-[var(--border-color)] text-[var(--text-primary)] font-semibold rounded-lg hover:opacity-80 transition-colors"
            >
              Back
            </button>
          </>
        )}

        {error && (
          <p className="text-red-500 text-sm mt-3">{error}</p>
        )}
      </div>
    </div>
  );
}
