import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Link, useLocation } from "react-router";

// Assume these icons are imported from an icon library
import {
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  LockIcon,
  SettingsIcon,
  UserIcon,
  TaskIcon,
  DormitoryIcon,
  GroupIcon,
  PieChartIcon,
  CalculatorIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { 
    name: string; 
    path: string; 
    pro?: boolean; 
    new?: boolean;
    requiredPermission?: string | string[];
  }[];
  requiredPermission?: string | string[]; // Permission yang diperlukan untuk menampilkan menu ini
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const sidebarGroups: NavGroup[] = [
  {
    title: "Menu Utama",
    items: [
      {
        icon: <GridIcon />,
        name: "Dashboard",
        path: "/",
      },
      {
        icon: <CalculatorIcon />,
        name: "HPP Calculator",
        path: "/hpp/calculator",
        requiredPermission: ["view_hpp_calculator"],
      },
    ],
  },
  {
    title: "HPP Master Data",
    items: [
      {
        icon: <TaskIcon />,
        name: "Rental Variables (VT/VB)",
        path: "/hpp/settings/variables",
        requiredPermission: ["view_hpp_master"],
      },
      {
        icon: <DormitoryIcon />,
        name: "Fair Values (WT/WB)",
        path: "/hpp/settings/fair-values",
        requiredPermission: ["view_hpp_master"],
      },
      {
        icon: <GroupIcon />,
        name: "Adjustment Factors (FP1-FP4)",
        path: "/hpp/settings/adjustment-factors",
        requiredPermission: ["view_hpp_master"],
      },
      {
        icon: <PieChartIcon />,
        name: "Taxes & Margin",
        path: "/hpp/settings/taxes-margin",
        requiredPermission: ["view_hpp_master"],
      },
    ],
  },
  {
    title: "System & Security",
    items: [
      {
        icon: <LockIcon />,
        name: "Access",
        subItems: [
          {
            name: "Users",
            path: "/users",
            requiredPermission: ["view_user"],
          },
          {
            name: "Roles",
            path: "/roles",
            requiredPermission: ["view_role"],
          },
        ],
      },
      {
        icon: <SettingsIcon />,
        name: "Site Settings",
        path: "/settings",
        requiredPermission: ["view_setting"],
      },
      {
        icon: <UserIcon />,
        name: "My Profile",
        path: "/profile",
        requiredPermission: ["view_myprofile"],
      },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const { hasPermission } = useAuth();
  const { getLogoUrl, getBrandLogoSquareUrl } = useSettings();

  const [openSubmenu, setOpenSubmenu] = useState<{
    groupIndex: number;
    itemIndex: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Filter menu items based on permissions
  const filteredNavGroups = useMemo(() => {
    return sidebarGroups.map((group) => {
      const filteredItems = group.items.map((item) => {
        // Filter subItems based on permissions
        if (item.subItems) {
          const filteredSubItems = item.subItems.filter((subItem) => {
            if (!subItem.requiredPermission) return true; // No permission required
            return hasPermission(subItem.requiredPermission);
          });
          
          // If parent item has permission check, check it first
          if (item.requiredPermission && !hasPermission(item.requiredPermission)) {
            return null;
          }
          
          // Return item with filtered subItems, or null if no subItems remain
          return filteredSubItems.length > 0 
            ? { ...item, subItems: filteredSubItems }
            : null;
        }
        
        // For items without subItems, check parent permission
        if (!item.requiredPermission) return item;
        return hasPermission(item.requiredPermission) ? item : null;
      }).filter((item): item is NavItem => item !== null);

      return filteredItems.length > 0 ? { ...group, items: filteredItems } : null;
    }).filter((group): group is NavGroup => group !== null);
  }, [hasPermission]);

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    filteredNavGroups.forEach((group, groupIndex) => {
      group.items.forEach((nav, itemIndex) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                groupIndex,
                itemIndex,
              });
              submenuMatched = true;
            }
          });
        }
        // Also check if the parent path matches (for items without subItems)
        if (nav.path && isActive(nav.path)) {
          submenuMatched = true;
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive, filteredNavGroups]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.groupIndex}-${openSubmenu.itemIndex}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (groupIndex: number, itemIndex: number) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.groupIndex === groupIndex &&
        prevOpenSubmenu.itemIndex === itemIndex
      ) {
        return null;
      }
      return { groupIndex, itemIndex };
    });
  };

  const renderMenuItems = (items: NavItem[], groupIndex: number) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, itemIndex) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(groupIndex, itemIndex)}
              className={`menu-item group ${
                openSubmenu?.groupIndex === groupIndex && openSubmenu?.itemIndex === itemIndex
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size  ${
                  openSubmenu?.groupIndex === groupIndex && openSubmenu?.itemIndex === itemIndex
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.groupIndex === groupIndex &&
                    openSubmenu?.itemIndex === itemIndex
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${groupIndex}-${itemIndex}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.groupIndex === groupIndex && openSubmenu?.itemIndex === itemIndex
                    ? `${subMenuHeight[`${groupIndex}-${itemIndex}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-[900] border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src={getLogoUrl(false)}
                alt="Logo"
                width={150}
                height={40}
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  if (!img.dataset.fallbackUsed) {
                    img.dataset.fallbackUsed = 'true';
                    img.src = '/images/logo/logo.svg';
                  } else {
                    img.style.display = 'none';
                  }
                }}
              />
              <img
                className="hidden dark:block"
                src={getLogoUrl(true)}
                alt="Logo"
                width={150}
                height={40}
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  if (!img.dataset.fallbackUsed) {
                    img.dataset.fallbackUsed = 'true';
                    img.src = '/images/logo/logo-dark.svg';
                  } else {
                    img.style.display = 'none';
                  }
                }}
              />
            </>
          ) : (
            <img
              src={getBrandLogoSquareUrl()}
              alt="Logo"
              width={32}
              height={32}
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                if (!img.dataset.fallbackUsed) {
                  img.dataset.fallbackUsed = 'true';
                  img.src = '/images/logo/logo-icon.svg';
                } else {
                  img.style.display = 'none';
                }
              }}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            {filteredNavGroups.map((group, groupIndex) => (
              <div key={group.title}>
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    group.title
                  ) : (
                    <HorizontaLDots className="size-6" />
                  )}
                </h2>
                {renderMenuItems(group.items, groupIndex)}
              </div>
            ))}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;

