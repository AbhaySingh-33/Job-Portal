"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { Briefcase, Home, Info, LogOut, Menu, User, X, MessageSquare } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ModeToggle } from "./mode-toggle";
import { useAppData } from "@/context/AppContext";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { isAuth, user, setIsAuth, setUser, loading, logoutUser } = useAppData();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const logoutHandler = () => {
    logoutUser();
  };

  return (
    <nav className="z-50 sticky top-0 bg-background/80 border-b backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href={"/"} className="flex items-center gap-1 group">
              <div className="text-2xl font-bold tracking-tight">
                <span className="bg-linear-to-r from bg-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Hire
                </span>
                <span className="text-red-500">Heaven</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <Link href={"/"}>
              <Button
                variant={"ghost"}
                className={`flex items-center gap-2 font-medium transition-all duration-200 rounded-xl px-4 ${
                  pathname === "/" 
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm" 
                    : "hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                <Home size={16} /> Home
              </Button>
            </Link>

            <Link href={"/jobs"}>
              <Button
                variant={"ghost"}
                className={`flex items-center gap-2 font-medium transition-all duration-200 rounded-xl px-4 ${
                  pathname === "/jobs" 
                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 shadow-sm" 
                    : "hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400"
                }`}
              >
                <Briefcase size={16} /> Jobs
              </Button>
            </Link>

            <Link href={"/about"}>
              <Button
                variant={"ghost"}
                className={`flex items-center gap-2 font-medium transition-all duration-200 rounded-xl px-4 ${
                  pathname === "/about" 
                    ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 shadow-sm" 
                    : "hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400"
                }`}
              >
                <Info size={16} /> About
              </Button>
            </Link>

            {isAuth && (
              <Link href={"/interview"}>
                <Button
                  variant={"ghost"}
                  className={`flex items-center gap-2 font-medium transition-all duration-200 rounded-xl px-4 ${
                    pathname.startsWith("/interview") 
                      ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 shadow-sm" 
                      : "hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400"
                  }`}
                >
                  <MessageSquare size={16} /> Interview
                </Button>
              </Link>
            )}
          </div>

          {/* Right side Actions */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              ""
            ) : (
              <>
                {isAuth ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="flex itmes-center gap-2 hover:opacity-80">
                        <Avatar className="h-9 w-9 ring-2 ring-offset-2 ring-offset-background ring-blue-500/20 cursor-pointer hover:ring-blue-500/40 transition-all">
                          <AvatarImage
                            src={user ? (user.profile_pic as string) : ""}
                            alt={user ? user.name : ""}
                          />
                          <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600">
                            {user?.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </PopoverTrigger>

                    <PopoverContent className="w-56 p-2" align="end">
                      <div className="px-3 py-2 mb-2 border-b">
                        <p className="text-sm font-semibold">{user && user.name} </p>
                        <p className="text-xs opacity-60 truncate">
                          {user && user.email}
                        </p>
                      </div>

                      <Link href={"/account"}>
                        <Button
                          className="w-full justify-start gap-2"
                          variant={"ghost"}
                        >
                          <User size={16} /> My Profile
                        </Button>
                      </Link>
                      <Button
                        className="w-full justify-start gap-2 mt-1"
                        variant={"ghost"}
                        onClick={logoutHandler}
                      >
                        <LogOut size={16} /> Logout
                      </Button>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <Link href={"/login"}>
                    <Button className="gap-2">
                      <User size={16} /> Sign In
                    </Button>
                  </Link>
                )}
              </>
            )}
            <ModeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <ModeToggle />
            <button
              onClick={toggleMenu}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} className="text-gray-700 dark:text-gray-300" /> : <Menu size={24} className="text-gray-700 dark:text-gray-300" />}
            </button>
          </div>
        </div>
      </div>

      {/* mobile view */}
      <div
        className={`md:hidden border-t border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-4 space-y-2 bg-white/95 dark:bg-black/95 backdrop-blur-xl">
          {/* Navigation Links */}
          <Link href={"/"} onClick={toggleMenu}>
            <Button
              variant={"ghost"}
              className={`w-full justify-start gap-3 h-12 font-medium rounded-xl ${
                pathname === "/" 
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" 
                  : "hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              <Home size={18} /> Home
            </Button>
          </Link>

          <Link href={"/jobs"} onClick={toggleMenu}>
            <Button
              variant={"ghost"}
              className={`w-full justify-start gap-3 h-12 font-medium rounded-xl ${
                pathname === "/jobs" 
                  ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" 
                  : "hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400"
              }`}
            >
              <Briefcase size={18} /> Jobs
            </Button>
          </Link>

          <Link href={"/about"} onClick={toggleMenu}>
            <Button
              variant={"ghost"}
              className={`w-full justify-start gap-3 h-12 font-medium rounded-xl ${
                pathname === "/about" 
                  ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" 
                  : "hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400"
              }`}
            >
              <Info size={18} /> About
            </Button>
          </Link>

          {isAuth && (
            <Link href={"/interview"} onClick={toggleMenu}>
              <Button
                variant={"ghost"}
                className={`w-full justify-start gap-3 h-12 font-medium rounded-xl ${
                  pathname.startsWith("/interview") 
                    ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400" 
                    : "hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400"
                }`}
              >
                <MessageSquare size={18} /> Interview
              </Button>
            </Link>
          )}

          <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
            {isAuth ? (
              <>
                <Link href={"/account"} onClick={toggleMenu}>
                  <Button
                    variant={"ghost"}
                    className={`w-full justify-start gap-3 h-12 font-medium rounded-xl ${
                      pathname === "/account" 
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" 
                        : "hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                    }`}
                  >
                    <User size={18} /> My Profile
                  </Button>
                </Link>
                <Button
                  variant={"ghost"}
                  className="w-full justify-start gap-3 h-12 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-xl font-medium mt-1"
                  onClick={() => {
                    logoutHandler();
                    toggleMenu();
                  }}
                >
                  <LogOut size={18} /> Logout
                </Button>
              </>
            ) : (
              <Link href={"/login"} onClick={toggleMenu}>
                <Button
                  className="w-full justify-start gap-3 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl"
                >
                  <User size={18} /> Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
