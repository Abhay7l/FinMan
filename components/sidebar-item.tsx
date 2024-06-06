"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
    label: string;
    iconSrc: string;
    href: string;
}

export const SidebarItem = ({
    label,
    iconSrc,
    href,
}: Props) => {
    const pathname = usePathname();
    const active = pathname === href;
    return (
        <Button
            variant={active? "sidebarOutline": "sidebar"}
            asChild
            className="justify-start h-[52px]"
        >
            <Link href={href}>
                <Image src={iconSrc}
                 height={32}
                 width={32}
                 alt={label}
                 className="mr-5"
                />
                {label}
            </Link>
        </Button>
    )
}