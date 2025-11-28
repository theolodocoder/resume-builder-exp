import { useState, useCallback, useEffect } from 'react';

const TOUR_STORAGE_KEY = 'resume-builder-tour-seen';
const TOUR_PREFERENCE_KEY = 'resume-builder-tour-preference';

export interface UseTourGuideOptions {
  autoStartFirstTime?: boolean;
}

export const useTourGuide = (options: UseTourGuideOptions = {}) => {
  const { autoStartFirstTime = false } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [run, setRun] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem(TOUR_STORAGE_KEY);
    return saved === 'true';
  });

  const [tourEnabled, setTourEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem(TOUR_PREFERENCE_KEY);
    return saved !== 'false';
  });

  // Auto-start tour on first visit if enabled
  useEffect(() => {
    if (autoStartFirstTime && !hasSeenTour && tourEnabled) {
      const timer = setTimeout(() => {
        setRun(true);
        setIsOpen(true);
      }, 500); // Delay to let page fully render

      return () => clearTimeout(timer);
    }
  }, [autoStartFirstTime, hasSeenTour, tourEnabled]);

  const startTour = useCallback(() => {
    setIsOpen(true);
    setRun(true);
  }, []);

  const closeTour = useCallback(() => {
    setIsOpen(false);
    setRun(false);
  }, []);

  const resetTour = useCallback(() => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    setHasSeenTour(false);
    setRun(true);
    setIsOpen(true);
  }, []);

  const disableTour = useCallback(() => {
    localStorage.setItem(TOUR_PREFERENCE_KEY, 'false');
    setTourEnabled(false);
    closeTour();
  }, [closeTour]);

  const enableTour = useCallback(() => {
    localStorage.setItem(TOUR_PREFERENCE_KEY, 'true');
    setTourEnabled(true);
  }, []);

  const markTourAsSeen = useCallback(() => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    setHasSeenTour(true);
  }, []);

  return {
    isOpen,
    run,
    hasSeenTour,
    tourEnabled,
    startTour,
    closeTour,
    resetTour,
    disableTour,
    enableTour,
    markTourAsSeen,
  };
};
