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
      <Card className="overflow-hidden shadow-lg border-2">
        <div className="h-32 bg-blue-500 relative">
          <div className="absolute -bottom-16 left-8">
            <div className="w-32 h-32 rounded-full border-4 border-background overflow-hidden shadow-xl bg-background">
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
                    className="absolute bottom-0 right-0
                rounded-full h-10 w-10 shadow-lg"
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
                <h1 className="text-3xl font-bold">{user.name}</h1>
                {/* Edit button */}
                {isYourAccount && (
                  <>
                    <Button
                      variant={"ghost"}
                      size={"icon"}
                      className="h-8 w-8"
                      onClick={handelEditClick}
                    >
                      <Edit size={16} />
                    </Button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm opacity-70">
                <Briefcase size={16} />
                <span className="capitalize">{user.role}</span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Mail size={20} className="text-blue-600" />
              Contact Information
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-lg border hover:border-blue-500 transition-colors">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Mail size={18} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs opacity-70 font-medium">Email</p>
                  <p className="text-sm truncate">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg border hover:border-blue-500 transition-colors">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Phone size={18} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs opacity-70 font-medium">Phone</p>
                  <p className="text-sm truncate">{user.phone_number}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Resume section */}
          {user.role === "jobseeker" && user.resume && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mt-4 flex items-center gap-2">
                <NotepadText size={20} className="text-blue-600" />
                Resume
              </h2>

              <div className="flex items-center gap-3 p-4 rounded-lg border hover:border-blue-500 transition-colors">
                <div className="h-12 w-12 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
                  <NotepadText size={20} className="text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Resume Document</p>
                  <Link
                    href={user.resume}
                    className="text-sm text-blue-500 hover:underline"
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
            <div className="mt-6 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2 text-sm font-medium opacity-70">
                <FileText size={16} />
                <span>About</span>
              </div>
              <p className="text-base leading-relaxed">{user.bio}</p>
            </div>
          )}

          {/* subscription section */}

          {isYourAccount && (
            <>
              {user.role === "jobseeker" && (
                <div className="mt-8">
                  <h2 className="text-lg font-semibold mt-4 flex items-center gap-2">
                    <Crown size={20} className="text-blue-600" />
                    Subscription Status
                  </h2>
                  <div className="p-6 rounded-lg bg-linear-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-950/20">
                    {!user.subscription ? (
                      <>
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div>
                            <p className="font-semibold text-lg mb-1">
                              No Active Subscription
                            </p>
                            <p className="text-sm opacity-70">
                              Subscribe to access premium features and benefits
                            </p>
                          </div>
                          <Button
                            className="gap-2"
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

                          <p className="text-sm opacity-70">
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
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-700 tect-white font-medium">
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

                            <p className="text-sm opacity-70">
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit profile</DialogTitle>
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
