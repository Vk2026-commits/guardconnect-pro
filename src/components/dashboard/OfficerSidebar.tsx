import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { User, Clock, Images, Award, Briefcase } from "lucide-react";

interface OfficerSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function OfficerSidebar({ activeTab, onTabChange }: OfficerSidebarProps) {
  const { open } = useSidebar();

  const items = [
    { title: "Profile", value: "profile", icon: User },
    { title: "Availability", value: "availability", icon: Clock },
    { title: "Photos", value: "photos", icon: Images },
    { title: "Certifications", value: "certifications", icon: Award },
    { title: "Work History", value: "work-history", icon: Briefcase },
  ];

  const getNavCls = (value: string) =>
    activeTab === value ? "bg-accent text-accent-foreground font-medium" : "hover:bg-muted/50";

  return (
    <Sidebar className={open ? "w-60" : "w-14"} collapsible="icon">
      <div className="h-16 border-b flex items-center justify-center">
        <span className={`font-semibold ${!open && "hidden"}`}>Menu</span>
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Officer</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.value)}
                    className={getNavCls(item.value)}
                  >
                    <item.icon className="h-4 w-4" />
                    {open && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
