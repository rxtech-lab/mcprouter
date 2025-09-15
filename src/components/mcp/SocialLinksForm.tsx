"use client";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Globe,
  Twitter,
  MessageSquare,
  Send,
  Instagram,
  Youtube,
  Linkedin,
  Facebook,
  Zap,
  Hash,
  TrendingUp,
  Twitch,
  Video,
} from "lucide-react";
import { Control, UseFormSetValue } from "react-hook-form";

interface SocialLinksFormProps {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
}

const socialPlatforms = [
  {
    key: "website",
    label: "Website",
    icon: Globe,
    placeholder: "https://example.com",
  },
  {
    key: "twitter",
    label: "Twitter",
    icon: Twitter,
    placeholder: "https://twitter.com/username",
  },
  {
    key: "discord",
    label: "Discord",
    icon: MessageSquare,
    placeholder: "https://discord.gg/server",
  },
  {
    key: "telegram",
    label: "Telegram",
    icon: Send,
    placeholder: "https://t.me/username",
  },
  {
    key: "instagram",
    label: "Instagram",
    icon: Instagram,
    placeholder: "https://instagram.com/username",
  },
  {
    key: "youtube",
    label: "YouTube",
    icon: Youtube,
    placeholder: "https://youtube.com/channel/...",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: Linkedin,
    placeholder: "https://linkedin.com/company/...",
  },
  {
    key: "facebook",
    label: "Facebook",
    icon: Facebook,
    placeholder: "https://facebook.com/page",
  },
  {
    key: "pinterest",
    label: "Pinterest",
    icon: Zap,
    placeholder: "https://pinterest.com/username",
  },
  {
    key: "reddit",
    label: "Reddit",
    icon: Hash,
    placeholder: "https://reddit.com/r/subreddit",
  },
  {
    key: "tiktok",
    label: "TikTok",
    icon: TrendingUp,
    placeholder: "https://tiktok.com/@username",
  },
  {
    key: "twitch",
    label: "Twitch",
    icon: Twitch,
    placeholder: "https://twitch.tv/username",
  },
  {
    key: "vimeo",
    label: "Vimeo",
    icon: Video,
    placeholder: "https://vimeo.com/username",
  },
];

export function SocialLinksForm({ control, setValue }: SocialLinksFormProps) {
  const clearAllLinks = () => {
    socialPlatforms.forEach((platform) => {
      setValue(`socialLinks.${platform.key}`, "");
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Social Links</h3>
          <p className="text-sm text-muted-foreground">
            Add social media and website links for your MCP server
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearAllLinks}
        >
          Clear All
        </Button>
      </div>

      <Separator />

      <div className="grid gap-4 md:grid-cols-2">
        {socialPlatforms.map((platform) => {
          const Icon = platform.icon;
          return (
            <FormField
              key={platform.key}
              control={control}
              name={`socialLinks.${platform.key}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {platform.label}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={platform.placeholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
