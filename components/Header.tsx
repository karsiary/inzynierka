import { NotificationsPopover } from "@/components/NotificationsPopover"
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  title: string
  description: string
}

export function Header({ title, description }: HeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();
  
  const userInitials = session?.user?.name 
    ? session.user.name.split(" ").map((word) => word[0]).join("")
    : "?";

  const handleSignIn = async () => {
    await signIn("credentials", {
      redirect: false,
      email: "", // Replace with actual email
      password: "", // Replace with actual password
    });
    router.refresh();
  };

  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-2xl font-bold text-[#fffcf2] mb-2 font-montserrat">{title}</h1>
        <p className="text-[#ccc5b9] font-open-sans">{description}</p>
      </div>
      <div className="flex items-center gap-4">
        <NotificationsPopover />
        <div className="w-10 h-10 rounded-full bg-[#403d39] flex items-center justify-center">
          <span className="text-[#fffcf2] font-semibold font-montserrat">{userInitials}</span>
        </div>
      </div>
    </div>
  )
}

