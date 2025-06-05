import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = cookies();
  const configured =  (await cookieStore).get("configured")?.value === "true";

  if (configured) {
    redirect("/dashboard");
  } else {
    redirect("/config");
  }
  // This will never render, but Next.js requires a component to return something
  return null;
}