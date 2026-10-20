import type { ReactNode, SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Svg({ size = 22, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  )
}

export function IconClock(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.2v5l3.2 1.9" />
    </Svg>
  )
}

export function IconCalendar(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="5" width="18" height="16" rx="3.5" />
      <path d="M8 3v4M16 3v4M3.5 10h17" />
    </Svg>
  )
}

export function IconScissors(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="6" cy="6" r="2.6" />
      <circle cx="6" cy="18" r="2.6" />
      <path d="M20 4.5 8.2 15.9M20 19.5 8.2 8.4" />
    </Svg>
  )
}

export function IconUsers(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M15.5 21v-1.8a4 4 0 0 0-4-4H6.5a4 4 0 0 0-4 4V21" />
      <circle cx="9" cy="7.5" r="3.6" />
      <path d="M21.5 21v-1.8a4 4 0 0 0-3-3.87M16 4.05a4 4 0 0 1 0 7.6" />
    </Svg>
  )
}

export function IconGear(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M5.2 5.2l1.9 1.9M16.9 16.9l1.9 1.9M18.8 5.2l-1.9 1.9M7.1 16.9l-1.9 1.9" />
    </Svg>
  )
}

export function IconPlus(props: IconProps) {
  return (
    <Svg strokeWidth={2.3} {...props}>
      <path d="M12 5.5v13M5.5 12h13" />
    </Svg>
  )
}

export function IconChevronRight(props: IconProps) {
  return (
    <Svg strokeWidth={2} {...props}>
      <path d="M9.5 5.5 16 12l-6.5 6.5" />
    </Svg>
  )
}

export function IconChevronLeft(props: IconProps) {
  return (
    <Svg strokeWidth={2} {...props}>
      <path d="M14.5 5.5 8 12l6.5 6.5" />
    </Svg>
  )
}

export function IconClose(props: IconProps) {
  return (
    <Svg strokeWidth={2.1} {...props}>
      <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
    </Svg>
  )
}

export function IconEdit(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 20h4l10-10a2.5 2.5 0 0 0-3.5-3.5L4.5 16.5 4 20Z" />
      <path d="M13.8 6.9l3.3 3.3" />
    </Svg>
  )
}

export function IconTrash(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 7h16M9.5 7V4.8h5V7M6.5 7l1 13h9l1-13M10.5 11v5.5M13.5 11v5.5" />
    </Svg>
  )
}

export function IconSearch(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </Svg>
  )
}

export function IconHeart(props: IconProps) {
  return (
    <Svg fill="currentColor" stroke="none" {...props}>
      <path d="M12 20.6s-7-4.3-8.8-8.3A5.2 5.2 0 0 1 12 6.4a5.2 5.2 0 0 1 8.8 5.9c-1.8 4-8.8 8.3-8.8 8.3Z" />
    </Svg>
  )
}

export function IconCheck(props: IconProps) {
  return (
    <Svg strokeWidth={2.2} {...props}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </Svg>
  )
}

export function IconPhone(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5Z" />
    </Svg>
  )
}

export function IconMessage(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M20.5 11.5a7.9 7.9 0 0 1-8.5 7.9 8.6 8.6 0 0 1-3.7-.8L3.5 20l1.4-4.6A7.9 7.9 0 1 1 20.5 11.5Z" />
    </Svg>
  )
}

export function IconMail(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m4 7.5 8 5.5 8-5.5" />
    </Svg>
  )
}

export function IconDownload(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3.5v11M7.5 10.5 12 15l4.5-4.5M4.5 19.5h15" />
    </Svg>
  )
}

export function IconUpload(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M4.5 19.5h15" />
    </Svg>
  )
}

export function IconInfo(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 7.6v.4" />
    </Svg>
  )
}

export function IconShare(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 15V3.5M8.5 7 12 3.5 15.5 7" />
      <path d="M5 13.5v5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5v-5" />
    </Svg>
  )
}
