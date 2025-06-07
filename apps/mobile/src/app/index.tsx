import React from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";

import { Button } from "~/components/ui/button";

export default function Index() {
  // const queryClient = useQueryClient();

  // const postQuery = useQuery(trpc.post.all.queryOptions());

  // const deletePostMutation = useMutation(
  //   trpc.post.delete.mutationOptions({
  //     onSettled: () =>
  //       queryClient.invalidateQueries(trpc.post.all.queryFilter()),
  //   }),
  // );

  return (
    <SafeAreaView className="bg-background">
      {/* Changes page title visible on the header */}
      <Stack.Screen options={{ title: "Home Page" }} />
      {/* <View className="h-full w-full bg-background p-4">
        <Text className="pb-2 text-center text-5xl font-bold text-foreground">
          Create <Text className="text-primary">T3</Text> Turbo
        </Text>

        <MobileAuth />

        <View className="py-2">
          <Text className="font-semibold italic text-primary">
            Press on a post
          </Text>
        </View>

        <LegendList
          data={postQuery.data ?? []}
          estimatedItemSize={20}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View className="h-2" />}
          renderItem={(p) => (
            <PostCard
              post={p.item}
              onDelete={() => deletePostMutation.mutate(p.item.id)}
            />
          )}
        />

        <CreatePost />
      </View> */}
      <Text>Hello world</Text>
      <Button>
        <Text>Click me</Text>
      </Button>
    </SafeAreaView>
  );
}
