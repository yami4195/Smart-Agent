import { View, Text, StyleSheet } from "react-native";

export function BranchMapPreview() {
    return (
        <View style={styles.container}>
        <Text style={styles.icon}>🗺️</Text>

        <Text style={styles.title}>
            Map Preview
        </Text>

        <Text style={styles.description}>
            Interactive maps are currently available on the mobile app.
        </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
    height: 250,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    padding: 20,
    },

    icon: {
        fontSize: 40,
    },

    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 10,
    },

    description: {
        textAlign: "center",
        marginTop: 8,
    },
});