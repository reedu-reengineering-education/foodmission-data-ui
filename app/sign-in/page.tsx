import SignIn from "@/components/sign-in";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <SignIn callbackUrl={callbackUrl ?? "/"} />
    </div>
  );
}
