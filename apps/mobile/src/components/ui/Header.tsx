import * as React from "react";
import { View } from "react-native";

import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Badge } from "./badge";
import { Button } from "./button";
import { Text } from "./text";
import { H1 } from "./typography";

interface HeaderProps {
  avatarUrl?: string;
  badgeEmoji?: string;
  onFilterPress?: () => void;
  onSearchPress?: () => void;
  subtitle?: string;
  title: string;
}

export function Header({
  title,
  subtitle,
  avatarUrl,
  badgeEmoji,
  onFilterPress,
  onSearchPress,
}: HeaderProps) {
  return (
    <View>
      <View className="flex-row items-center justify-between px-4 pb-4 pt-8">
        {/* Left: Avatar */}
        <View className="flex-row items-center gap-3">
          <Avatar alt="avatar">
            {avatarUrl ? (
              <AvatarImage source={{ uri: avatarUrl }} />
            ) : (
              <AvatarFallback>
                <Text>{title.charAt(0)}</Text>
              </AvatarFallback>
            )}
            {/* Online dot */}
            <View
              className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500"
              style={{ position: "absolute", bottom: 0, right: 0 }}
            />
          </Avatar>
        </View>
        {/* Right: Actions */}
        <View className="flex-row items-center gap-2">
          {onFilterPress && (
            <Button onPress={onFilterPress} size="icon" variant="ghost">
              <Text style={{ fontSize: 22 }}>≡</Text>
            </Button>
          )}
          {onSearchPress && (
            <Button onPress={onSearchPress} size="icon" variant="ghost">
              <Text style={{ fontSize: 22 }}>🔍</Text>
            </Button>
          )}
        </View>
      </View>
      <View>
        <H1>{title}</H1>
        <View className="mt-1 flex-row items-center gap-1">
          {badgeEmoji && (
            <Badge variant="secondary">
              <Text>{badgeEmoji}</Text>
            </Badge>
          )}
          {subtitle && (
            <Text className="ml-1 text-lg text-muted-foreground">
              {subtitle}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
