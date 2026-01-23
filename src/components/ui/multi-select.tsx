"use client";

import { useId, useState } from "react";

import { ChevronsUpDownIcon, XIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";

interface TeamOption {
    id: string;
    name: string;
    abbrev: string;
}

interface TeamMultiSelectProps {
    teams: TeamOption[];
    selectedTeamIds: string[];
    onSelectionChange: (teamIds: string[]) => void;
    placeholder?: string;
    label?: string;
}

export const TeamMultiSelect = ({
    teams,
    selectedTeamIds,
    onSelectionChange,
    placeholder = "Select teams...",
    label = "Teams",
}: TeamMultiSelectProps) => {
    const id = useId();
    const [open, setOpen] = useState(false);

    const toggleSelection = (teamId: string) => {
        onSelectionChange(
            selectedTeamIds.includes(teamId)
                ? selectedTeamIds.filter((id) => id !== teamId)
                : [...selectedTeamIds, teamId],
        );
    };

    const removeSelection = (teamId: string) => {
        onSelectionChange(selectedTeamIds.filter((id) => id !== teamId));
    };

    const getTeamById = (teamId: string) => teams.find((t) => t.id === teamId);

    return (
        <div className="w-full space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        id={id}
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="h-auto min-h-9 rounded-xl w-full justify-between dark:bg-muted dark:hover:bg-muted/60"
                    >
                        <div className="flex flex-wrap items-center gap-1 pr-2.5">
                            {selectedTeamIds.length > 0 ? (
                                selectedTeamIds.map((teamId) => {
                                    const team = getTeamById(teamId);

                                    return team ? (
                                        <Badge
                                            key={teamId}
                                            variant="outline"
                                            className="gap-1 rounded-md border-white/10 bg-white/10 px-2 py-0.5 font-normal backdrop-blur-sm"
                                        >
                                            {team.name}
                                            <button
                                                type="button"
                                                className="-mr-0.5 inline-flex size-4 items-center justify-center rounded-sm text-white/60 transition-colors hover:bg-white/20 hover:text-white"
                                                onPointerDown={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                }}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    removeSelection(teamId);
                                                }}
                                            >
                                                <XIcon className="size-3" />
                                            </button>
                                        </Badge>
                                    ) : null;
                                })
                            ) : (
                                <span className="text-muted-foreground">
                                    {placeholder}
                                </span>
                            )}
                        </div>
                        <ChevronsUpDownIcon
                            className="text-muted-foreground/80 size-4 shrink-0"
                            aria-hidden="true"
                        />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-(--radix-dropdown-menu-trigger-width) max-h-60 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/30"
                    align="start"
                >
                    {teams.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            No teams available
                        </div>
                    ) : (
                        teams.map((team) => (
                            <DropdownMenuCheckboxItem
                                key={team.id}
                                checked={selectedTeamIds.includes(team.id)}
                                onCheckedChange={() => toggleSelection(team.id)}
                                onSelect={(e) => e.preventDefault()}
                            >
                                <span className="truncate">
                                    {team.name} ({team.abbrev})
                                </span>
                            </DropdownMenuCheckboxItem>
                        ))
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};
