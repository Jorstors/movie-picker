import Link from "next/link";
import { Button } from "@/components/ui/button";
const tabs = [
  { name: 'Main', href: '/', current: true },
  { name: 'Calendar', href: '/calendar', current: false },
];

function TabBar() {
  return (
    <div className="min-w-[30vw] h-20 gap-3 flex items-center justify-between bg-amber-300">
      {tabs.map((tab) => (
        <Link
          key={tab.name}
          href={tab.href}
        >
          <Button
            variant={tab.current ? 'default' : 'outline'}
            size="lg"
            className="w-30 md:w-50 lg:w-70 hover:cursor-pointer"
          >
            {tab.name}
          </Button>
        </Link>
      ))}
    </div>
  )
};

export default TabBar;
