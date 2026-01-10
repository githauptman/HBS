import LoginForm from "./LoginForm";

export default async function LoginPage(
  props: { searchParams: Promise<{ error?: string }> }
) {
  const searchParams = await props.searchParams;
  const error = searchParams?.error;

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
      <LoginForm />
      {error && <pre className="mt-3 text-sm text-red-600">{error}</pre>}
    </main>
  );
}
