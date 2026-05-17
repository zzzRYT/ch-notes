import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function NoteEditor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>노트 에디터 — id: {id}</Text>
    </View>
  );
}
