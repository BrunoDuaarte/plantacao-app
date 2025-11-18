import React from 'react';
import { View, Text, ScrollView, Button, Platform } from 'react-native';
import { useStorage } from '../hooks/useStorage';

/**
 * Carregamento condicional:
 * - no web usamos 'victory'
 * - no mobile usamos 'victory-native'
 *
 * Usamos require() dentro do componente para evitar erros de importação estática.
 */

export default function Graficos() {
  const [dados, setDados] = useStorage('estatisticas', [
    { x: 1, y: 10 },
    { x: 2, y: 30 },
    { x: 3, y: 20 },
  ]);

  // carregar lib compatível com a plataforma
  let VictoryChart = null;
  let VictoryLine = null;
  let VictoryTheme = null;

  try {
    if (Platform.OS === 'web') {
      // versão para navegador
      const v = require('victory');
      VictoryChart = v.VictoryChart;
      VictoryLine = v.VictoryLine;
      VictoryTheme = v.VictoryTheme;
    } else {
      // versão para mobile
      const v = require('victory-native');
      VictoryChart = v.VictoryChart;
      VictoryLine = v.VictoryLine;
      VictoryTheme = v.VictoryTheme;
    }
  } catch (err) {
    console.warn('Erro ao carregar biblioteca de gráficos:', err);
  }

  function adicionarValor() {
    setDados([...dados, { x: dados.length + 1, y: Math.floor(Math.random() * 100) }]);
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Estatísticas da Plantação 🌱
      </Text>

      {VictoryChart && VictoryLine && VictoryTheme ? (
        <View style={{ alignItems: 'center' }}>
          <VictoryChart theme={VictoryTheme.material} width={350}>
            <VictoryLine data={dados} style={{ data: { strokeWidth: 2 } }} />
          </VictoryChart>
        </View>
      ) : (
        <View style={{ padding: 20 }}>
          <Text style={{ color: '#666' }}>
            Não foi possível carregar a biblioteca de gráficos nesta plataforma.
            Verifique se instalou as dependências (`victory` para web, `victory-native` + `react-native-svg` para mobile).
          </Text>
        </View>
      )}

      <View style={{ marginTop: 30 }}>
        <Button title="Adicionar Dados Aleatórios" onPress={adicionarValor} />
      </View>
    </ScrollView>
  );
}


