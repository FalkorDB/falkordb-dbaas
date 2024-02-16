'use client'

import Navbar from "@/app/components/navbar";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Info, LogOut, Waypoints } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRef, useState } from "react";
import { ImperativePanelHandle } from "react-resizable-panels";

const LINKS = [
    {
        name: "Connection Details",
        href: "/details",
        icon: (<Info className="h-6 w-6" />),
    },
    {
        name: "Graph",
        href: "/graph",
        icon: (<Waypoints className="h-6 w-6" />),
    },
    {
        name: "Disconnect",
        href: "",
        icon: (<LogOut className="h-6 w-6" />),
        onClick: () => { signOut({ callbackUrl: '/login' }) }
    },
]

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    const [isCollapsed, setCollapsed] = useState(false)
    const navPanel = useRef<ImperativePanelHandle>(null)

    const onExpand = () => {
        if (navPanel.current) {
            if (navPanel.current.isCollapsed()) {
                navPanel.current.expand()
            } else {
                navPanel.current.collapse()
            }
        }
    }

    const panelSize = 10
    const collapsedSize = 3

    return (
        <ResizablePanelGroup direction="horizontal" className='min-h-screen'>
            <ResizablePanel
                ref={navPanel}
                maxSize={panelSize}
                defaultSize={panelSize}
                collapsedSize={collapsedSize}
                collapsible
                minSize={panelSize}
                onCollapse={() => { setCollapsed(true) }}
                onExpand={() => { setCollapsed(false) }}>
                <Navbar links={LINKS} collapsed={isCollapsed} onExpand={onExpand} />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={100 - panelSize}>{children}</ResizablePanel>
        </ResizablePanelGroup>
    );
}
