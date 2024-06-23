import {useScrollToTop} from "@react-navigation/native";
import {FlashList} from "@shopify/flash-list";
import {eq} from "drizzle-orm";
import {Link, Stack, useFocusEffect, useRouter} from "expo-router";
import * as React from "react";
import {Pressable, View} from "react-native";
import {ThemeToggle} from "@/components/ThemeToggle";
import {Button} from "@/components/ui/button";
import {useLiveQuery} from "drizzle-orm/expo-sqlite";
import {useTheme} from "next-themes";
import tw from 'twrnc';
import {Progress} from "@/components/ui/progress";
import {Text} from "@/components/ui/text";
import {habitTable} from "@/db/schema";
import {Plus, PlusCircle} from "@/components/Icons";
import {useMigrationHelper} from "@/db/drizzle";
import {useDatabase} from "@/db/provider";
import {SettingsIcon} from "lucide-react-native";
import {HabitCard} from "@/components/habit";
import type {Habit} from "@/lib/storage";

export default function Screen() {
    const {success, error} = useMigrationHelper();

    if (error) {
        return (
            <View style={tw`flex-1 gap-5 p-6 bg-secondary/30`}>
                <Text>Migration error: {error.message}</Text>
            </View>
            );
        }

    if (!success) {
        return (
            <View style={tw`flex-1 gap-5 p-6 bg-secondary/30`}>
                <Text>Migration is in progress...</Text>
            </View>
        );
    }

    return <ScreenContent />;
}

function ScreenContent() {
    const {db} = useDatabase();
    const {data: habits, error} = useLiveQuery(db?.select().from(habitTable));

    const ref = React.useRef(null);
    useScrollToTop(ref);

    const renderItem = React.useCallback(
        ({item}: {item: Habit}) => <HabitCard {...item} />,
        [],
    );

    if (error) {
        return (
            <View style={tw`flex-1 items-center justify-center bg-secondary/30`}>
                <Text style={tw`text-destructive pb-2`}>Error Loading data</Text>
            </View>
        );
    }
    return (
        <View style={tw`flex flex-col basis-full bg-background p-8`}>
            <Stack.Screen
                options={{
                    title: "Habits",
                    headerRight: () => <ThemeToggle />,
                }}
            />
            <FlashList
                ref={ref}
                contentContainerStyle={tw`native:overflow-hidden rounded-t-lg`}
                estimatedItemSize={49}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                    <View>
                        <Text style={tw`text-lg`}>Hi There 👋</Text>
                        <Text style={tw`text-sm`}>
                            This example uses sql.js on Web and expo/sqlite on native
                        </Text>
                        <Text style={tw`text-sm`}>
                            If you change the schema, you need to run{" "}
                            <Text style={tw`text-sm font-mono text-muted-foreground bg-muted`}>
                                bun migrate
                            </Text>
                        </Text>
                    </View>
                )}
                ItemSeparatorComponent={() => <View style={tw`p-2`} />}
                data={habits}
                renderItem={renderItem}
                keyExtractor={(_, index) => `item-${index}`}
                ListFooterComponent={<View style={tw`py-4`} />}
            />
            <View style={tw`absolute web:bottom-20 bottom-10 right-8`}>
                <Link href="/create" asChild>
                    <Pressable>
                        <View style={tw`bg-primary justify-center rounded-full h-[45px] w-[45px]`}>
                            <Plus style={tw`text-background self-center`} />
                        </View>
                    </Pressable>
                </Link>
            </View>
        </View>
    );
}
