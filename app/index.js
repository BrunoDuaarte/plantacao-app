import { View, Text, Button } from 'react-native';
import { Link } from 'expo-router';

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
        padding: 20,
        backgroundColor: '#F7F7F7',
      }}
    >
      <Text
        style={{
          fontSize: 32,
          fontWeight: 'bold',
          marginBottom: 10,
          color: '#2E7D32',
        }}
      >
        Plantação 🌱
      </Text>

      <Text
        style={{
          fontSize: 16,
          textAlign: 'center',
          opacity: 0.7,
          marginBottom: 30,
          paddingHorizontal: 20,
        }}
      >
        Sistema de registro e estatísticas das suas plantações.
      </Text>

      {/* Botão de Registro */}
      <Link href="/registro" asChild>
        <Button title="Registrar Plantação" />
      </Link>

      {/* Botão de Gráficos */}
      <Link href="/graficos" asChild>
        <Button title="Ver Gráficos" />
      </Link>
    </View>
  );
}
