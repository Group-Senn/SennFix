import { createContext, useContext } from 'react';

export const FeedbackContext = createContext(null);

// showToast(mensaje, 'error' | 'success')  ·  await confirm(mensaje, { confirmLabel, danger })  ->  true | false
export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error('useFeedback debe usarse dentro de FeedbackProvider');
  return context;
}
