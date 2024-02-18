'use client'

import Navbar from "@/app/components/navbar";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { BookOpen, Database, Folder, User } from "lucide-react";
import { useRef, useState } from "react";
import { ImperativePanelHandle } from "react-resizable-panels";

const LINKS = [
    {
        name: "Databases",
        href: "/dashboard/databases",
        icon: (<Database className="h-6 w-6" />),
    },
    {
        name: "Documents",
        href: "/dashboard/documents",
        icon: (<BookOpen className="h-6 w-6" />),
    },
    {
        name: "Members",
        href: "/dashboard/members",
        icon: (<User className="h-6 w-6" />),
    },
]

const SELECTOR = {
    label: "Projects",
    list: ["Proj1", "Proj2", "Proj3"],
    icon: (<Folder className="h-6 w-6" />),
    onSelect: (selected: string) => { console.log(selected) }
}

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
                <Navbar selector={SELECTOR} links={LINKS} collapsed={isCollapsed} onExpand={onExpand} />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={100 - panelSize}>{children}</ResizablePanel>
        </ResizablePanelGroup>
    );
}
