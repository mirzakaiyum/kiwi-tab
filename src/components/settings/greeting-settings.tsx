import { CircleHelp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  SettingsGroup,
  SettingsItem,
  SettingsItemWithInput,
} from "@/components/settings/settings";

interface GreetingSettingsProps {
  greetingEnabled: boolean;
  onGreetingEnabledChange: (enabled: boolean) => void;
  customGreeting: string;
  onCustomGreetingChange: (greeting: string) => void;
  customName: string;
  onCustomNameChange: (name: string) => void;
}

export function GreetingSettings({
  greetingEnabled,
  onGreetingEnabledChange,
  customGreeting,
  onCustomGreetingChange,
  customName,
  onCustomNameChange,
}: GreetingSettingsProps) {
  return (
    <SettingsGroup title="Greeting">
      {/* Enable Greetings Switch */}
      <SettingsItem label="Enable Greetings">
        <Switch
          checked={greetingEnabled}
          onCheckedChange={onGreetingEnabledChange}
        />
      </SettingsItem>

      {/* Greeting Customization - only show if enabled */}
      {greetingEnabled && (
        <SettingsItemWithInput
          label="Greeting"
          tooltip={
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="outline-none">
                  <CircleHelp className="size-3.5 text-muted-foreground cursor-help" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="border border-border bg-background text-foreground">
                <p>Leave empty for time-based greeting</p>
              </TooltipContent>
            </Tooltip>
          }
        >
          <Input
            value={customGreeting}
            onChange={(e) => onCustomGreetingChange(e.target.value)}
            placeholder="Bonjour"
            className="w-40 text-sm"
          />
        </SettingsItemWithInput>
      )}

      {/* Name Customization - only show if enabled */}
      {greetingEnabled && (
        <SettingsItemWithInput
          label="Name"
          tooltip={
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="outline-none">
                  <CircleHelp className="size-3.5 text-muted-foreground cursor-help" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="border border-border bg-background text-foreground">
                <p>Leave empty to show "there"</p>
              </TooltipContent>
            </Tooltip>
          }
        >
          <Input
            value={customName}
            onChange={(e) => onCustomNameChange(e.target.value)}
            placeholder="there"
            className="w-40 text-sm"
          />
        </SettingsItemWithInput>
      )}
    </SettingsGroup>
  );
}
