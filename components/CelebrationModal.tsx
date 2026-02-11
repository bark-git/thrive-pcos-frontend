'use client';

import { useEffect, useState } from 'react';

interface CelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'streak' | 'milestone' | 'first' | 'week';
  value?: number;
  message?: string;
}

export default function CelebrationModal({ isOpen, onClose, type, value, message }: CelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      // Auto-close after 4 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const celebrations = {
    streak: {
      icon: '🔥',
      title: `${value} Day Streak!`,
      subtitle: 'You\'re on fire! Keep it going!',
      gradient: 'from-orange-400 via-red-500 to-sage-500'
    },
    milestone: {
      icon: '🏆',
      title: message || `${value} Entries!`,
      subtitle: 'Amazing dedication to your health journey!',
      gradient: 'from-yellow-400 via-orange-500 to-red-500'
    },
    first: {
      icon: '🌟',
      title: 'First Entry!',
      subtitle: 'You\'ve taken the first step on your health journey!',
      gradient: 'from-peach-400 via-sage-500 to-red-500'
    },
    week: {
      icon: '📅',
      title: 'One Week Complete!',
      subtitle: 'You\'ve been tracking for a whole week. Insights unlocked!',
      gradient: 'from-blue-400 via-sage-500 to-sage-500'
    }
  };

  const content = celebrations[type];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <div 
                className="w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3'][Math.floor(Math.random() * 7)],
                  transform: `rotate(${Math.random() * 360}deg)`
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Modal Content */}
      <div className="relative z-10 animate-celebration-pop">
        <div className={`bg-gradient-to-br ${content.gradient} rounded-3xl p-8 text-center text-white shadow-2xl max-w-sm mx-auto`}>
          <div className="text-7xl mb-4 animate-bounce">{content.icon}</div>
          <h2 className="text-3xl font-bold mb-2">{content.title}</h2>
          <p className="text-white/90 text-lg mb-6">{content.subtitle}</p>
          
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-full font-semibold transition"
          >
            Keep Going! 💪
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
        @keyframes celebration-pop {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-celebration-pop {
          animation: celebration-pop 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
