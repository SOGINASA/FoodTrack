import { create } from 'zustand';

const useToastStore = create((set) => ({
  toasts: [],

  // Add a new toast
  showToast: (message, type = 'success', duration = 3000) => {
    const id = Date.now();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration }],
    }));

    // Auto-remove toast after duration
    if (duration) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }

    return id;
  },

  // Remove a specific toast
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  // Convenience methods
  success: (message, duration) => useToastStore.getState().showToast(message, 'success', duration),
  error: (message, duration) => useToastStore.getState().showToast(message, 'error', duration),
  warning: (message, duration) => useToastStore.getState().showToast(message, 'warning', duration),
  info: (message, duration) => useToastStore.getState().showToast(message, 'info', duration),
}));

export default useToastStore;
