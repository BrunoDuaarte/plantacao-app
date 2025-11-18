// App.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  Alert,
  Switch,
  Platform,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

// Utilidade para validar email / data
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const dataRegex = /^\d{2}\/\d{2}\/\d{4}$/; // DD/MM/YYYY

export default function App() {
  // Form fields
  const [cultura, setCultura] = useState('milho');
  const [dataPlantio, setDataPlantio] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [soloFertil, setSoloFertil] = useState(true);

  // Optional contact fields for exercise (nome/email) shown in material
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');

  const [plantacoes, setPlantacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const STORAGE_KEY = 'plantacoes_v1';

  // Carregar plantações do AsyncStorage ao iniciar
  useEffect(() => {
    carregarPlantacoes();
  }, []);

  const carregarPlantacoes = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        setPlantacoes(JSON.parse(raw));
      }
    } catch (e) {
      console.error('Erro ao carregar', e);
      Alert.alert('Erro', 'Não foi possível carregar os dados salvos.');
    } finally {
      setLoading(false);
    }
  };

  // Salvar lista inteira em AsyncStorage
  const salvarPlantacoes = async (lista) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    } catch (e) {
      console.error('Erro ao salvar', e);
      Alert.alert('Erro', 'Não foi possível salvar os dados.');
    }
  };

  // Validação dos campos antes de registrar
  const validarCampos = () => {
    setErro('');
    if (!dataPlantio || !dataRegex.test(dataPlantio)) {
      setErro('Preencha a data no formato DD/MM/YYYY.');
      return false;
    }
    if (!quantidade || isNaN(Number(quantidade))) {
      setErro('Quantidade deve ser numérica.');
      return false;
    }
    if (nome && typeof nome !== 'string') {
      setErro('Nome inválido.');
      return false;
    }
    if (email && !emailRegex.test(email)) {
      setErro('Email inválido.');
      return false;
    }
    return true;
  };

  const registrarPlantacao = async () => {
    if (!validarCampos()) return;

    const nova = {
      id: Date.now(),
      cultura,
      dataPlantio,
      quantidade: Number(quantidade),
      soloFertil,
      nome: nome.trim(),
      email: email.trim(),
    };

    const novaLista = [...plantacoes, nova];
    setPlantacoes(novaLista);
    await salvarPlantacoes(novaLista);

    // limpa campos de input (exceto picker/switch)
    setDataPlantio('');
    setQuantidade('');
    setNome('');
    setEmail('');
    setErro('');
  };

  const deletarPlantacao = async (id) => {
    Alert.alert('Confirmar', 'Deseja deletar este registro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: async () => {
          const nova = plantacoes.filter((p) => p.id !== id);
          setPlantacoes(nova);
          await salvarPlantacoes(nova);
        },
      },
    ]);
  };

  const limparTudo = async () => {
    Alert.alert('Confirmar', 'Limpar todos os registros?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Limpar',
        style: 'destructive',
        onPress: async () => {
          setPlantacoes([]);
          await AsyncStorage.removeItem(STORAGE_KEY);
        },
      },
    ]);
  };

  // Exportar para CSV (funciona em Web; em Mobile usa fallback com alert e copia conteúdo)
  const exportToCSV = async () => {
    if (!plantacoes.length) {
      Alert.alert('Exportar', 'Não há dados para exportar.');
      return;
    }
    const headers = ['id', 'cultura', 'dataPlantio', 'quantidade', 'soloFertil', 'nome', 'email'];
    const rows = plantacoes.map((p) =>
      headers
        .map((h) => {
          let v = p[h];
          if (v === undefined || v === null) return '';
          // Escapar aspas e envolver em aspas se necessário
          const s = String(v).replace(/"/g, '""');
          return `"${s}"`;
        })
        .join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');

    if (Platform.OS === 'web') {
      // download no navegador
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `plantacoes_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      Alert.alert('Exportar', 'Download iniciado.');
    } else {
      // fallback mobile: copia CSV para clipboard como opção (ou podes integrar FileSystem/Sharing)
      try {
        // tenta usar Clipboard (expo-clipboard) — se não estiver instalado, mostra CSV direto
        // Para simplificar sem dependências extras, mostra alert e loga parte do CSV
        console.log('CSV:', csv);
        Alert.alert('Exportar', 'CSV gerado (veja console). Para mobile, recomenda-se integrar expo-file-system + Sharing.');
      } catch (e) {
        console.error(e);
        Alert.alert('Exportar', 'Não foi possível exportar automaticamente. CSV impresso no console.');
      }
    }
  };

  // Exemplo de fetch robusto com timeout + tratamento (opcional)
  const fetchComTimeout = useCallback(async (url, ms = 5000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), ms);
    try {
      const resp = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      if (!resp.ok) throw new Error(`Erro HTTP ${resp.status}`);
      const json = await resp.json();
      return json;
    } catch (err) {
      if (err.name === 'AbortError') throw new Error('Requisição expirou');
      throw err;
    }
  }, []);

  // Por exemplo, carregar previsões (a chamada abaixo é apenas demonstrativa)
  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const dados = await fetchComTimeout('https://api.exemplo.com/previsao');
  //       console.log(dados);
  //     } catch (e) {
  //       console.warn('API erro', e.message);
  //     }
  //   })();
  // }, [fetchComTimeout]);

  // Memoize contadores / somatórios para performance e exibição de relatório simples
  const resumo = useMemo(() => {
    const total = plantacoes.length;
    const totalKg = plantacoes.reduce((s, p) => s + (Number(p.quantidade) || 0), 0);
    return { total, totalKg };
  }, [plantacoes]);

  // Render item
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>
          {item.cultura} — {item.quantidade} kg
        </Text>
        <Text style={styles.itemSub}>{item.dataPlantio} • Solo fértil: {item.soloFertil ? 'Sim' : 'Não'}</Text>
        {item.nome ? <Text style={styles.itemSub}>Responsável: {item.nome}</Text> : null}
        {item.email ? <Text style={styles.itemSub}>Email: {item.email}</Text> : null}
      </View>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => deletarPlantacao(item.id)}>
        <Text style={{ color: '#fff' }}>Deletar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Registro de Plantações</Text>

        <View style={styles.formRow}>
          <Text style={styles.label}>Cultura</Text>
          <View style={styles.pickerWrapper}>
            <Picker selectedValue={cultura} onValueChange={setCultura}>
              <Picker.Item label="Milho" value="milho" />
              <Picker.Item label="Soja" value="soja" />
              <Picker.Item label="Trigo" value="trigo" />
              <Picker.Item label="Algodão" value="algodao" />
            </Picker>
          </View>
        </View>

        <View style={styles.formRow}>
          <Text style={styles.label}>Data (DD/MM/YYYY)</Text>
          <TextInput
            placeholder="ex: 12/11/2025"
            value={dataPlantio}
            onChangeText={setDataPlantio}
            style={styles.input}
          />
        </View>

        <View style={styles.formRow}>
          <Text style={styles.label}>Quantidade (kg)</Text>
          <TextInput placeholder="Quantidade" value={quantidade} onChangeText={setQuantidade} keyboardType="numeric" style={styles.input} />
        </View>

        <View style={[styles.formRow, { alignItems: 'center', justifyContent: 'space-between' }]}>
          <Text style={styles.label}>Solo fértil</Text>
          <Switch value={soloFertil} onValueChange={setSoloFertil} />
        </View>

        <View style={styles.separator} />

        <Text style={[styles.subtitle, { marginTop: 8 }]}>Contato (opcional)</Text>
        <TextInput placeholder="Nome" value={nome} onChangeText={setNome} style={styles.input} />
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" style={styles.input} />

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <View style={styles.buttonsRow}>
          <Button title="Registrar Plantação" onPress={registrarPlantacao} />
          <View style={{ width: 12 }} />
          <Button title="Limpar tudo" color="#E53935" onPress={limparTudo} />
        </View>

        <View style={styles.resumo}>
          <Text>Registros: {resumo.total}</Text>
          <Text>Total kg: {resumo.totalKg}</Text>
        </View>

        <View style={{ marginVertical: 8 }}>
          <Button title="Exportar CSV" onPress={exportToCSV} />
        </View>

        <View style={styles.separatorLarge} />

        <Text style={styles.subtitle}>Histórico</Text>

        {loading ? (
          <Text>Carregando...</Text>
        ) : plantacoes.length === 0 ? (
          <Text style={{ color: '#666' }}>Nenhuma plantação registrada.</Text>
        ) : (
          <FlatList
            data={plantacoes}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            style={{ width: '100%' }}
          />
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
    alignItems: 'stretch',
    backgroundColor: '#F7F8FA',
    minHeight: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  formRow: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  buttonsRow: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 8,
  },
  resumo: {
    marginTop: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  separator: {
    height: 1,
    backgroundColor: '#EFEFEF',
    marginVertical: 12,
  },
  separatorLarge: {
    height: 1,
    backgroundColor: '#E6E6E6',
    marginVertical: 18,
  },
  erro: {
    color: '#B00020',
    marginBottom: 8,
  },
  item: {
    backgroundColor: '#fff',
    padding: 12,
    marginVertical: 6,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  itemTitle: { fontWeight: '700', marginBottom: 4 },
  itemSub: { color: '#555', fontSize: 13 },
  deleteBtn: {
    backgroundColor: '#E53935',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 12,
  },
});
