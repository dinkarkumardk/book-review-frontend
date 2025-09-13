import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: { background: '#0f172a', color: 'white' },
        success: { style: { background: '#0369a1' } },
      }}
    />
  );
}
