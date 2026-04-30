import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppData } from "@/context/AppContext";
import { AccountProps } from "@/type";
import {
  AlertTriangle,
  Briefcase,
  Camera,
  CheckCircle2,
  Crown,
  Edit,
  FileText,
  Mail,
  NotepadText,
  Phone,
  RefreshCcw,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useRef, useState } from "react";

const Info: React.FC<AccountProps> = ({ user, isYourAccount }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const editRef = useRef<HTMLButtonElement | null>(null);
  const resumeRef = useRef<HTMLInputElement | null>(null);

  const [name, setname] = useState("");
  const [phoneNumber, setphoneNumber] = useState("");
  const [bio, setbio] = useState("");

  const { updateProfilePic, updateResume, btnLoading, updateUser } =
    useAppData();

  const router = useRouter();

  const handelClick = () => {
    inputRef.current?.click();
  };

  const handelResumeClick = () => {
    resumeRef.current?.click();
  };

  const ChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      updateProfilePic(formData);
    }
  };

  const handelEditClick = () => {
    editRef.current?.click();
    setname(user.name);
    setphoneNumber(user.phone_number);
    setbio(user.bio || "");
  };

  const updateProfileHandler = () => {
    updateUser(name, phoneNumber, bio);
  };

  const ChangeResume = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Please upload a pdf file");
        return;
      }
      const formData = new FormData();
      formData.append("file", file);
      updateResume(formData);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Card className="overflow-hidden border border-slate-200/80 bg-white/80 shadow-2xl backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/75">
        <div className="relative h-36 bg-linear-to-r from-cyan-600 via-blue-600 to-indigo-700">
          <div className="absolute -bottom-16 left-8">
            <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-2xl dark:border-slate-900 dark:bg-slate-800">
              <div className="relative group">
                <img
                  src={user.profile_pic ? user.profile_pic : "/user.jpg"}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>

              {isYourAccount && (
                <>
                  <Button
                    variant={"secondary"}
                    size={"icon"}
                    onClick={handelClick}
                    className="absolute bottom-0 right-0 h-10 w-10 rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-lg hover:bg-white dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200"
                  >
                    <Camera size={18} />
                  </Button>

                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    ref={inputRef}
                    onChange={ChangeHandler}
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="pt-20 pb-8 px-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{user.name}</h1>
                {/* Edit button */}
                {isYourAccount && (
                  <>
                    <Button
                      variant={"ghost"}
                      size={"icon"}
                      className="h-8 w-8 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                      onClick={handelEditClick}
                    >
                      <Edit size={16} />
                    </Button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Briefcase size={16} />
                <span className="capitalize">{user.role}</span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              <Mail size={20} className="text-blue-600" />
              Contact Information
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/70 p-4 transition-colors hover:border-cyan-400 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-cyan-500">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900/40">
                  <Mail size={18} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Email</p>
                  <p className="truncate text-sm text-slate-800 dark:text-slate-200">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/70 p-4 transition-colors hover:border-cyan-400 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-cyan-500">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900/40">
                  <Phone size={18} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Phone</p>
                  <p className="truncate text-sm text-slate-800 dark:text-slate-200">{user.phone_number}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Resume section */}
          {user.role === "jobseeker" && user.resume && (
            <div className="mt-8">
              <h2 className="mt-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                <NotepadText size={20} className="text-blue-600" />
                Resume
              </h2>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/70 p-4 transition-colors hover:border-cyan-400 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-cyan-500">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/40">
                  <NotepadText size={20} className="text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Resume Document</p>
                  <Link
                    href={user.resume}
                    className="text-sm text-cyan-600 hover:underline dark:text-cyan-400"
                    target="_blank"
                  >
                    View Resume PDF
                  </Link>
                </div>
                {/* Edit Resume Button */}
                {isYourAccount && (
                  <>
                    <Button
                      variant={"outline"}
                      size={"sm"}
                      className="border-slate-300 bg-white/80 text-slate-700 hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      onClick={handelResumeClick}
                    >
                      Edit Resume
                    </Button>
                    <input
                      type="file"
                      ref={resumeRef}
                      className="hidden"
                      accept="application/pdf"
                      onChange={ChangeResume}
                    />
                  </>
                )}
              </div>
            </div>
          )}

          {/* Bio section */}
          {user.role === "jobseeker" && user.bio && (
            <div className="mt-6 rounded-xl border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-900/60">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                <FileText size={16} />
                <span>About</span>
              </div>
              <p className="text-base leading-relaxed text-slate-700 dark:text-slate-200">{user.bio}</p>
            </div>
          )}

          {/* subscription section */}

          {isYourAccount && (
            <>
              {user.role === "jobseeker" && (
                <div className="mt-8">
                  <h2 className="mt-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                    <Crown size={20} className="text-blue-600" />
                    Subscription Status
                  </h2>
                  <div className="rounded-xl border border-cyan-200/70 bg-linear-to-br from-cyan-50 to-blue-50 p-6 dark:border-cyan-900/40 dark:from-cyan-950/25 dark:to-blue-950/25">
                    {!user.subscription ? (
                      <>
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div>
                            <p className="mb-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                              No Active Subscription
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              Subscribe to access premium features and benefits
                            </p>
                          </div>
                          <Button
                            className="gap-2 bg-linear-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500"
                            onClick={() => router.push("/subscribe")}
                          >
                            <Crown size={18} />
                            Subscribe Now
                          </Button>
                        </div>
                      </>
                    ) : new Date(user.subscription).getTime() > Date.now() ? (
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2
                              size={20}
                              className="text-green-600"
                            />
                            <p className="font-semibold text-lg text-green-600">
                              Active Subscription
                            </p>
                          </div>

                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            Valid until:{" "}
                            {new Date(user.subscription).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 rounded-full bg-green-700 px-4 py-2 font-medium text-white">
                          <CheckCircle2 size={18} /> Subscribed
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle
                                size={20}
                                className="text-red-600"
                              />
                              <p className="font-semibold text-lg text-red-600">
                                Subscription Expired
                              </p>
                            </div>

                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              Expired On:{" "}
                              {new Date(user.subscription).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </p>
                          </div>

                          <Button
                            variant="destructive"
                            className="gap-2"
                            onClick={() => router.push("/subscribe")}
                          >
                            <RefreshCcw size={18} />
                            Renew Subscription
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
      {/* Dialog box for edit */}
      <Dialog>
        <DialogTrigger asChild>
          <Button ref={editRef} variant="outline" className="hidden">
            Edit Profile
          </Button>
        </DialogTrigger>

        {/* Dialog content here */}
        <DialogContent className="sm:max-w-[500px] border-slate-200 bg-white/95 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
          <DialogHeader>
            <DialogTitle className="text-2xl text-slate-900 dark:text-slate-100">Edit profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium flex items-center gap-2"
              >
                <UserIcon size={16} /> Full Name
              </Label>

              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                className="h-11"
                value={name}
                onChange={(e) => setname(e.target.value)}
              />
              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Phone size={16} /> Phone Number
                </Label>

                <Input
                  id="phone"
                  type="text"
                  placeholder="Enter Phone Number"
                  className="h-11"
                  value={phoneNumber}
                  onChange={(e) => setphoneNumber(e.target.value)}
                />
              </div>

              {user.role === "jobseeker" && (
                <div className="space-y-2">
                  <Label
                    htmlFor="bio"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <NotepadText size={16} /> Bio
                  </Label>

                  <Input
                    id="bio"
                    type="text"
                    placeholder="Enter your Bio"
                    className="h-11"
                    value={bio}
                    onChange={(e) => setbio(e.target.value)}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                disabled={btnLoading}
                onClick={updateProfileHandler}
                className="w-full h-11"
                type="submit"
              >
                {btnLoading ? "Saving Changes..." : "Save changes"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Info;
