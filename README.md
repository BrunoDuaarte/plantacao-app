# 🌱 Plantação App

Aplicativo desenvolvido em **React Native + Expo** para **controle e gestão de plantações**, permitindo registrar cultivos, acompanhar o crescimento, visualizar estatísticas com gráficos e salvar tudo automaticamente via AsyncStorage.

---

## 🚜 Funcionalidades
- **Cadastro de plantações** (nome, data, quantidade, estágio, observações)
- **Lista completa de registros** com filtro
- **Gráficos estatísticos** usando `react-native-svg-charts`
- **Salvamento automático** via AsyncStorage
- **Edição e exclusão** de plantações
- **Interface leve e minimalista**

---

## 📁 Estrutura do Projeto
```
plantacao-app/
│── app/
│   ├── index.js           # Página inicial
│   ├── registro.js        # Cadastro de plantações
│   ├── lista.js           # Lista de registros
│   ├── graficos.js        # Estatísticas
│── components/            # Componentes reutilizáveis
│── assets/                # Imagens
│── package.json
│── app.json
│── README.md
```

---

## ▶️ Como Executar o Projeto
```bash
# Instalar dependências
npm install

# Iniciar o aplicativo
npx expo start
```
Abra no navegador, celular ou emulador Android/iOS.

---

## 📦 Dependências Principais
```bash
npx expo install @react-native-async-storage/async-storage
npx expo install react-native-svg react-native-svg-charts
npx expo install expo-router
```

---

## 📈 Gráficos
O projeto utiliza:
- `react-native-svg`
- `react-native-svg-charts`

Inclui contagem de cultivos e distribuição por categorias.

---

## 🤝 Contribuição
Pull requests são bem-vindos.

---

## 📄 Licença
MIT License.

