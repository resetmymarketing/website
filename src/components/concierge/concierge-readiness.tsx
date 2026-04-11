'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { springs } from '@/lib/motion';

interface ConciergeReadinessProps {
  onReady: () => void;
  onNotReady: () => void;
}

export function ConciergeReadiness({ onReady, onNotReady }: ConciergeReadinessProps) {
  const [showUnsurePopup, setShowUnsurePopup] = useState(false);

  return (
    <div className="mx-auto max-w-2xl px-4 text-center">
      <p className="mb-2 text-sm font-medium uppercase tracking-widest text-sage-600 dark:text-sage-400">
        Question 5 of 5
      </p>
      <h2 className="text-2xl font-bold text-brand-800 dark:text-brand-100 sm:text-3xl">
        Are you ready to commit to this reset?
      </h2>

      <div className="mx-auto mt-6 max-w-xl rounded-xl bg-brand-50 px-6 py-5 text-left text-sm leading-relaxed text-warm-800 dark:bg-dark-800 dark:text-white">
        &ldquo;This reset requires you to be present, willing, and ready to make real changes. Nothing happens on its own -- everything I am going to give you requires you to implement it. I can show you the path, but you have to walk it. Your commitment to implementation matters more than my strategy. Whether you have zero marketing experience or years of experience, the action required is the same: you have to be ready to actually do the work.&rdquo;
      </div>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button onClick={onReady} className="w-full sm:w-auto">
          Yes, I am ready
        </Button>
        <Button variant="outline" onClick={() => setShowUnsurePopup(true)} className="w-full sm:w-auto">
          I am unsure
        </Button>
        <Button variant="ghost" onClick={onNotReady} className="w-full text-warm-600 sm:w-auto">
          No, not yet
        </Button>
      </div>

      <AnimatePresence>
        {showUnsurePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/60 p-4"
            onClick={() => setShowUnsurePopup(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="unsure-heading"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={springs.snappy}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-dark-800 sm:p-8"
            >
              <h3 id="unsure-heading" className="text-lg font-bold text-brand-800 dark:text-brand-100">
                What does &ldquo;ready to commit&rdquo; actually mean?
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-warm-800 dark:text-warm-300">
                Being ready means you are willing to actually use what we create together. It means setting aside time to implement the strategies, post the content, and track the results. It means showing up for your business even when it is hard.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-warm-800 dark:text-warm-300">
                Ask yourself: Do I have the bandwidth right now? Am I willing to make this a priority for the next 90 days?
              </p>
              <p className="mt-3 text-sm leading-relaxed text-warm-800 dark:text-warm-300">
                If the answer is yes, you are ready. If it is still no or maybe, that is okay -- come back when you are certain. There is no shame in waiting until you are truly ready.
              </p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <Button onClick={() => { setShowUnsurePopup(false); onReady(); }} className="w-full sm:w-auto">
                  Yes, I am ready
                </Button>
                <Button variant="outline" onClick={() => { setShowUnsurePopup(false); onNotReady(); }} className="w-full sm:w-auto">
                  I will come back later
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
