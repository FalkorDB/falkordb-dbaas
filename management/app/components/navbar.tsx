import { Menu } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "../../components/ui/switch";
import { Label } from "../../components/ui/label";
import Github from "../../components/icons/github";
import AvatarButton from "./AvatarButton";

export interface LinkDefinition {
  name: string,
  href: string,
  icon: JSX.Element,
  onClick?: () => void
}

export interface SelectorDefinition {
  label: string,
  list: string[],
  icon: JSX.Element,
  onSelect?: (selected: string) => void
}

export default function Navbar({ selector, links, collapsed, onExpand }: { selector: SelectorDefinition, links: LinkDefinition[], collapsed: boolean, onExpand: () => void }) {
  const { status } = useSession()
  const { theme, setTheme, systemTheme } = useTheme()

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const setDarkMode = (val: boolean) => {
    if (val) {
      setTheme("dark")
    }
    else {
      setTheme("light")
    }
  }

  const darkmode = theme === "dark" || (theme === "system" && systemTheme === "dark")
  return (
    <nav className="w-full h-full bg-gray-100 dark:bg-gray-800 p-5 space-y-4 flex flex-col">
      <div className="flex items-center space-x-2">
        {/* eslint-disable jsx-a11y/anchor-is-valid */}
        <Link href="" onClick={onExpand}>
          <Menu className="h-6 w-6" />
        </Link>
        {!collapsed && (<Link href="/" className="font-bold text-xl">Home</Link>)}
      </div>
      {
        mounted &&
        <div className="flex items-center space-x-2">
          <Switch id="dark-mode" checked={darkmode} onCheckedChange={setDarkMode} />
          {!collapsed && (<Label className="text-lg" htmlFor="dark-mode">{`${theme} mode`}</Label>)}
        </div>
      }
      {status === "authenticated" &&
        <>
          <AvatarButton collapsed={collapsed} classname="text-lg" />
          <Select onValueChange={selector.onSelect} defaultValue={selector.list[0]}>
            <SelectTrigger  className="text-xl" >
              {selector.icon}
              {!collapsed && <SelectValue placeholder={selector.label}  />}
            </SelectTrigger>
            <SelectContent>
              {
                selector.list.map((item) => (
                  <SelectItem className="text-xl" key={item} value={item}>{item}</SelectItem>
                ))
              }
            </SelectContent>
          </Select>
          <ul className="space-y-4">
            {
              links.map((link, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <li key={index} className="flex items-center space-x-2">
                  <Link title={link.name} className="items-center underline underline-offset-2 flex space-x-2 text-xl" href={link.href} onClick={link.onClick}>
                    {link.icon} {!collapsed && (<p> {link.name}</p>)}
                  </Link>
                </li>
              ))
            }
          </ul>
        </>
      }
      <footer className="flex flex-row items-center space-x-1 fixed bottom-1 text-xs">
        <a href="https://github.com/falkordb/falkordb-browser" title="Github repository" aria-label="Github repository">
          <Github darkMode={darkmode} className="h-4 w-4" />
        </a>
        <span>Made by</span>
        <a className="underline" href="https://www.falkordb.com">FalkorDB</a>
      </footer>
    </nav>
  )
}
