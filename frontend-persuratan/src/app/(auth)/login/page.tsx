import { LoginForm } from '@/features/auth/components/LoginForm';

export default function LoginPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 40%, #1e1b4b 100%)',
      }}
    >
      <LoginForm />
    </div>
  );
}
