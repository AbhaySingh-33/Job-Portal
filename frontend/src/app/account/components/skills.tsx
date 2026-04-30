"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppData } from "@/context/AppContext";
import { AccountProps } from "@/type";
import { Award, Plus, Sparkle, X } from "lucide-react";
import React, { useState } from "react";

const Skills: React.FC<AccountProps> = ({ user, isYourAccount }) => {
  const [skill, setskill] = useState("");
  const { addSkill, btnLoading, removeSkill } = useAppData();

  const addSkillHandler = () => {
    if (!skill.trim()) {
      alert("Please enter a skill");
      return;
    }
    addSkill(skill, setskill);
  };

  const handelKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addSkillHandler();
    }
  };

  const removeSkillHandler = (skillToRemove: string) => {
    if (confirm(`Are you sure you want to remove ${skillToRemove} skill?`)) {
      removeSkill(skillToRemove);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <Card className="overflow-hidden border border-slate-200/80 bg-white/80 shadow-2xl backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/75">
        <div className="border-b border-cyan-700/20 bg-linear-to-r from-cyan-600 to-blue-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/90 dark:bg-slate-900/80">
              <Award size={20} className="text-cyan-600" />
            </div>
            <CardTitle className="text-2xl text-white">
              {isYourAccount ? "Your Skills" : `${user.name}'s Skills`}
            </CardTitle>
            {isYourAccount && (
              <CardDescription className="mt-1 text-sm text-cyan-50">
                Showcase your expertise and abilities
              </CardDescription>
            )}
          </div>
        </div>
        {/* Add Skills Input */}
        {isYourAccount && (
          <div className="flex flex-col gap-3 border-b border-slate-200/70 bg-slate-50/80 p-6 dark:border-slate-700 dark:bg-slate-900/50 sm:flex-row">
            <div className="relative flex-1">
              <Sparkle
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                type="text"
                placeholder="e.g. React, Node.js, Python..."
                className="h-11 border-slate-300 bg-white pl-10 text-slate-800 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                value={skill}
                onChange={(e) => setskill(e.target.value)}
                onKeyPress={handelKeyPress}
              />
            </div>
            <Button
              onClick={addSkillHandler}
              className="h-11 gap-2 bg-linear-to-r from-cyan-600 to-blue-600 px-6 text-white hover:from-cyan-500 hover:to-blue-500"
              disabled={!skill.trim() || btnLoading}
            >
              <Plus size={18} /> Add Skill
            </Button>
          </div>
        )}
        <CardContent className="p-6">
          {user.skills && user.skills.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {user.skills.map((e, i) => (
                <div
                  key={i}
                  className="group relative inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50/80 py-2 pl-4 pr-3 text-cyan-900 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm dark:border-cyan-700/70 dark:bg-cyan-950/30 dark:text-cyan-100"
                >
                  <span className="font-medium text-sm">{e}</span>

                  {isYourAccount && (
                    <button
                      onClick={() => removeSkillHandler(e)}
                      className="flex h-6 w-6 items-center justify-evenly rounded-full text-red-500 transition-all hover:scale-110 hover:bg-red-100 dark:hover:bg-red-900/40"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="text-center py-12">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                  <Award size={32} className="opacity-40" />
                </div>

                <CardDescription className="text-base text-slate-600 dark:text-slate-300">
                  {isYourAccount
                    ? "No skills added yet. Start building your profile!"
                    : "No skills added by this user"}
                </CardDescription>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Skills;
