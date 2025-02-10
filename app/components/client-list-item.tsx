import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { Client } from "@/types/clientTypes";

type Props = {
  client: Client;
  onPress: (client: Client) => void;
};

const ClientListItem: React.FC<Props> = ({ client, onPress }) => (
  <TouchableOpacity
    style={[styles.itemContainer, client.identificacion % 2 === 0 && styles.evenBackground]}
    onPress={() => onPress(client)}
    accessibilityRole="button"
  >
    <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">
      {client.nombre}
    </Text>
    <Text style={styles.cedText}>{client.cedula}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  itemContainer: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: "#e0e7ff",
    shadowColor: "#818cf8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  evenBackground: {
    backgroundColor: "#ede9fe",
  },
  nameText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4338ca",
  },
  cedText: {
    fontSize: 14,
    color: "#4f46e5",
    marginTop: 4,
  },
});

export default React.memo(ClientListItem);