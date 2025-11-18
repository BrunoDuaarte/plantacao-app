import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';

export default function Registro() {
  const [tipo, setTipo] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [area, setArea] = useState('');
  const [data, setData] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const [registros, setRegistros] = useState([]);
  const [editandoId, setEditandoId] = useState(null);

  // ============================
  // LOAD AUTOMÁTICO
  // ============================
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const dados = await AsyncStorage.getItem('plantacoes');
      if (dados) setRegistros(JSON.parse(dados));
    } catch (error) {
      console.log(error);
    }
  };

  // ============================
  // SAVE AUTOMÁTICO
  // ============================
  useEffect(() => {
    salvarDados();
  }, [registros]);

  const salvarDados = async () => {
    try {
      await AsyncStorage.setItem('plantacoes', JSON.stringify(registros));
    } catch (error) {
      console.log(error);
    }
  };

  // ============================
  // ADICIONAR / EDITAR
  // ============================
  const salvarRegistro = () => {
    if (!tipo || !quantidade || !area || !data) {
      return Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
    }

    const novoRegistro = {
      id: editandoId ? editandoId : Date.now().toString(),
      tipo,
      quantidade,
      area,
      data,
      observacoes,
    };

    if (editandoId) {
      const atualizados = registros.map((item) =>
        item.id === editandoId ? novoRegistro : item
      );
      setRegistros(atualizados);
      setEditandoId(null);
    } else {
      setRegistros([novoRegistro, ...registros]);
    }

    limparCampos();
  };

  const limparCampos = () => {
    setTipo('');
    setQuantidade('');
    setArea('');
    setData('');
    setObservacoes('');
    setEditandoId(null);
  };

  // ============================
  // EXCLUIR
  // ============================
  const excluirRegistro = (id) => {
    Alert.alert('Confirmar', 'Deseja excluir este registro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        onPress: () => {
          const filtrados = registros.filter((item) => item.id !== id);
          setRegistros(filtrados);
        },
      },
    ]);
  };

  // ============================
  // EDITAR
  // ============================
  const editarRegistro = (item) => {
    setTipo(item.tipo);
    setQuantidade(item.quantidade);
    setArea(item.area);
    setData(item.data);
    setObservacoes(item.observacoes);
    setEditandoId(item.id);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container}>
        <Text style={styles.titulo}>Registrar Plantação 🌱</Text>

        {/* INPUTS */}
        <View style={styles.card}>
          <Text style={styles.label}>Tipo de Plantação</Text>
          <View style={styles.pickerBox}>
            <Picker
              selectedValue={tipo}
              onValueChange={(value) => setTipo(value)}
            >
              <Picker.Item label="Selecione..." value="" />
              <Picker.Item label="Milho" value="milho" />
              <Picker.Item label="Soja" value="soja" />
              <Picker.Item label="Trigo" value="trigo" />
              <Picker.Item label="Feijão" value="feijao" />
            </Picker>
          </View>

          <Text style={styles.label}>Quantidade Plantada (kg)</Text>
          <TextInput
            style={styles.input}
            value={quantidade}
            onChangeText={setQuantidade}
            keyboardType="numeric"
            placeholder="Ex: 250"
          />

          <Text style={styles.label}>Área Plantada (m² ou ha)</Text>
          <TextInput
            style={styles.input}
            value={area}
            onChangeText={setArea}
            keyboardType="numeric"
            placeholder="Ex: 1500"
          />

          <Text style={styles.label}>Data da Plantação</Text>
          <TextInput
            style={styles.input}
            value={data}
            onChangeText={setData}
            placeholder="DD/MM/AAAA"
          />

          <Text style={styles.label}>Observações</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            value={observacoes}
            onChangeText={setObservacoes}
            multiline
            placeholder="Alguma observação?"
          />

          <Button
            title={editandoId ? 'Salvar Alterações' : 'Adicionar Registro'}
            onPress={salvarRegistro}
          />
        </View>

        {/* LISTA */}
        <Text style={styles.subtitulo}>Registros Salvos</Text>

        <FlatList
          data={registros}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitulo}>{item.tipo}</Text>
                <Text style={styles.itemTexto}>Qtd: {item.quantidade} kg</Text>
                <Text style={styles.itemTexto}>Área: {item.area}</Text>
                <Text style={styles.itemTexto}>Data: {item.data}</Text>
                {item.observacoes ? (
                  <Text style={styles.itemTexto}>
                    Obs: {item.observacoes}
                  </Text>
                ) : null}
              </View>

              {/* BOTÕES */}
              <View style={styles.botoes}>
                <TouchableOpacity onPress={() => editarRegistro(item)}>
                  <Text style={styles.btnEditar}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => excluirRegistro(item.id)}>
                  <Text style={styles.btnExcluir}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F6F6F6',
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#2E7D32',
  },
  card: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
    elevation: 3,
    gap: 10,
  },
  label: {
    fontWeight: '600',
    marginTop: 5,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  pickerBox: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFF',
  },
  subtitulo: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  item: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 12,
  },
  itemTitulo: {
    fontSize: 18,
    fontWeight: '600',
  },
  itemTexto: {
    opacity: 0.8,
  },
  botoes: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 8,
  },
  btnEditar: {
    color: '#1E88E5',
    fontWeight: '700',
  },
  btnExcluir: {
    color: '#E53935',
    fontWeight: '700',
  },
});
