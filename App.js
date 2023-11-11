import { StyleSheet, Text, TextInput, TouchableOpacity, View,SafeAreaView, Modal, Button, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'; 
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import React, {useState, useEffect} from 'react'
const {Screen, Navigator} = createBottomTabNavigator();

export default function App() {
  const [logado,setLogado] = useState(true)
  const [lista, setLista] = useState([])
  const [edicaoAtiva, setEdicaoAtiva] = useState(false);
  const [refeicaoEditando, setRefeicaoEditando] = useState('');
  const [novoNomeRefeicao, setNovoNomeRefeicao] = useState('');
  const inserirRefeicao = async (value)=>{
    try{
      const novaLista = [...lista, value];
      setLista(novaLista);
      await AsyncStorage.setItem("Refeicoes", JSON.stringify(novaLista));
      // const json = JSON.stringify(value);
      // await AsyncStorage.setItem(key,json,callback);
    }
    catch(e){
      throw new Error("Erro ao inserir refeição");
    }
  }
  const verRefeicao = async(key,callback=null)=>{
    try{
      return await AsyncStorage.getItem(key,callback)
    }
    catch(e){
      throw new Error("Erro ao consultar refeições")
    }
  }
  const verRefeicaoObj = async(key,callback=null)=>{
    try{
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue): null;
    }
    catch(e){
      throw new Error("Erro ao consultar refeições objeto")
    }
  }
  const verTodasRefeicoes = async(callback=null)=>{
    try{
      let refeicao = await AsyncStorage.getItem('Refeicoes',callback)
       
      alert(refeicao)
    }
    catch(e){
      throw new Error("Erro ao consultar refeições...")
    }
  }
  const removerRefeicao = async(index)=>{
    try {
      const novasRefeicoes = [...lista];
      novasRefeicoes.splice(index, 1);
      setLista(novasRefeicoes)
      await AsyncStorage.setItem("Refeicoes",JSON.stringify(novasRefeicoes))
    } catch (e) {
      throw new Error("Erro ao apagar refeição...")
    }
  }
  const ativarEdicao = (index) => {
    setRefeicaoEditando(lista[index]);
    setNovoNomeRefeicao(lista[index]);
    setEdicaoAtiva(true);
  };

  const salvarEdicao = async () => {
    try {
      const index = lista.indexOf(refeicaoEditando);
      const novasRefeicoes = [...lista];
      novasRefeicoes[index] = novoNomeRefeicao;
      setLista(novasRefeicoes);
      await AsyncStorage.setItem('Refeicoes', JSON.stringify(novasRefeicoes));
      setEdicaoAtiva(false);
      setRefeicaoEditando('');
      // setNovoNomeRefeicao('');
    } catch (error) {
      console.error('Erro ao salvar edição:', error);
    }
  };
  const limpar = async(callback=null)=>{
    await AsyncStorage.clear(callback)
  }
  // telas
  const TelaDeEdicao = ()=>{

  }
  const RecuperacaoSenha = (props)=>{
    return(
      <View style={{flex:1,justifyContent:'center',alignItems:'center', gap:15}}>
        <Text style={styles.title}>Recuperação de Senha</Text>
        <TextInput style={styles.input} placeholder='e-mail'/>
        <TouchableOpacity style={styles.button}><Text>enviar e-mail de recuperação	</Text></TouchableOpacity>
      </View>
    )
  }
  const ModalAdd = (props)=>{
    const [refeicao,setRefeicao] = useState()
    return(
      <View style={{flex:1, alignItems:'center', justifyContent:'center', backgroundColor:'#d9d9d9'}}>
          <View style={{elevation:10,width:'70%', height: 300,backgroundColor:'#fff',borderRadius:15, justifyContent:'center',alignItems:'center', gap:15, alignSelf:'center'}}>
            <Text style={styles.title}>Adicionar refeição</Text>
            <TextInput onChangeText={setRefeicao} style={styles.input} placeholder='Nome da refeição'/>
            <TouchableOpacity style={styles.button} onPress={()=>{
              let ref = refeicao!=null ? refeicao:null
              if (ref != null) {
                props.onSave(ref)
              }
              else{
                alert("Campo obrigatório.")
              }
            }}><Text>Salvar</Text></TouchableOpacity>
          </View>
      </View>
    )
  }
  const [isLoading, setLoading] = useState(false);
  function TelaDeRefeicoes() {
    
    const getRefeicoes = async () => {
      setLoading(true);
      try {
        const refeicoesJSON = await AsyncStorage.getItem('Refeicoes');
        if (refeicoesJSON) {
          const refeicoesArray = JSON.parse(refeicoesJSON);
          setLista(refeicoesArray);
        }
      } catch (error) {
        console.error('Erro ao recuperar refeições do AsyncStorage:', error);
      } finally {
        setLoading(false);
      }
    };
    return (
      <View style={{width:'100%'}}>
      <Text style={{alignSelf:'center', fontSize:30, marginBottom:15}}>Lista de Refeições</Text>
      {isLoading ? (
        <Text style={{alignSelf:'center', fontSize:18, margin:10}}>Carregando...</Text>
      ) : (
        <FlatList
          data={lista}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View>
              {edicaoAtiva && refeicaoEditando === item ? (
                <View>
                  <TextInput autoFocus
                    value={novoNomeRefeicao}
                    onChangeText={setNovoNomeRefeicao}
                  />
                  <Button title="Salvar" onPress={salvarEdicao} />
                </View>
              ) : (
                <View style={styles.refeicao}>
                  <Text>{item}</Text>
                  <Button title="Editar" onPress={() => ativarEdicao(index)} />
                  <TouchableOpacity onPress={() => removerRefeicao(index)}>
                    <Ionicons name="trash-bin" size={24} color="red" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      )}
      <TouchableOpacity onPress={getRefeicoes} style={{backgroundColor:'#6abbfc', borderRadius:10, padding:10, justifyContent:'center', alignItems:'center', width:'70%', alignSelf:'center'}}>
        <Text>Recarregar Refeições</Text>
      </TouchableOpacity>
    </View>
    );
  }
  const Login = (props)=>{
    return(
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput style={styles.input} placeholder='E-mail'/>
      <TextInput style={styles.input} placeholder='Senha'/>
      <View style={{display:'flex', flexDirection:'row',justifyContent:'space-around', width:'70%'}}>
        <Text style={{textDecorationLine:'underline'}}>Não tenho uma conta</Text>
        <Text style={{textDecorationLine:'underline'}}>Esqueci minha senha</Text>
      </View>
      <TouchableOpacity onPress={()=>{props.isLogado(true)}} style={styles.button}><Text>Entrar</Text></TouchableOpacity>
    </View>
    )
  }
  const Home =(props)=>{
    return(
      <View style={{flex:1,justifyContent:"space-evenly"}}>
        <View style={{width:'60%',alignSelf:'center'}}>
          <Text style={{fontSize:18}}>Esta semana</Text>
          <View style={styles.calendario}>
            <View style={{flexDirection:'column',justifyContent:'center',alignItems:'center',margin:1}}>
              <Text>D</Text>
              <Ionicons name='star'/>
            </View>
            <View style={{flexDirection:'column',justifyContent:'center',alignItems:'center',margin:1}}>
              <Text>S</Text>
              <Ionicons name='star'/>
            </View>
            <View style={{flexDirection:'column',justifyContent:'center',alignItems:'center',margin:1}}>
              <Text>T</Text>
              <Ionicons name='star'/>
            </View>
            <View style={{flexDirection:'column',justifyContent:'center',alignItems:'center',margin:1}}>
              <Text>Q</Text>
              <Ionicons name='star'/>
            </View>
            <View style={{flexDirection:'column',justifyContent:'center',alignItems:'center',margin:1}}>
              <Text>Q</Text>
              <Ionicons name='star'/>
            </View>
            <View style={{flexDirection:'column',justifyContent:'center',alignItems:'center',margin:1}}>
              <Text>S</Text>
              <Ionicons name='star'/>
            </View>
            <View style={{flexDirection:'column',justifyContent:'center',alignItems:'center',margin:1}}>
              <Text>S</Text>
              <Ionicons name='star'/>
            </View>
          </View>

        </View>
        
        <View style={{alignItems:'center', justifyContent:'center',width:'70%',alignSelf:'center'}}>
          <TelaDeRefeicoes/>
        </View>
      </View>
    )
  }
  const Chat = (props)=>{
    const [msg,setMsg] = useState([])
    const [inputValue, setInputValue] = useState('');
    const [responseData, setResponseData] = useState('');
    const handlePostRequest = async () => {
      try {
        // Defina a URL para a sua requisição POST
        const url = 'https://sprint4-fiap-default-rtdb.firebaseio.com/mensagens.json';
  
        // Crie um objeto com os dados do input
        const data = { input: inputValue };
  
        // Faça a requisição POST usando o axios
        const response = await axios.post(url, data);
  
        // Atualize o estado com a resposta da requisição
        setResponseData(response.data);
        setInputValue('');
        fetchData()
      } catch (error) {
        console.error('Erro na requisição POST:', error);
      }
    };
    const fetchData = async () => {
      try {
        const response = await axios.get('https://sprint4-fiap-default-rtdb.firebaseio.com/mensagens.json');
        setMsg(response.data); // Armazena os dados no estado
      } catch (error) {
        console.error('Erro ao fazer a requisição:', error);
      } 
    };
    useEffect(() => {
      // Executa a função fetchData imediatamente
      fetchData();
  
      // Define um intervalo para chamar a função fetchData a cada 5 segundos
      const intervalId = setInterval(fetchData, 5000);
  
      // Função de limpeza para parar o intervalo quando o componente for desmontado
      return () => clearInterval(intervalId);
    }, []);
    return(
      <SafeAreaView style={{flex:1,marginTop:50,alignItems:'center'}}>
        <Ionicons name='arrow-back' size={30} style={{position:'absolute', left:20}} />
        <Text style={styles.title}>Chat</Text>
        <View accessibilityLabel='conversa' style={{alignItems:'center', gap:14, width:'100%', height:'80%'}}>
          <View style={styles.chatL}>
            <Text style={styles.chatText}>Olá sou Bianca, sua assistente virtual.</Text>
          </View>
          <View style={styles.chatL}>
            <Text style={styles.chatText}>Em que posso ajudar?</Text>
          </View>
          {Object.keys(msg).map((key) => ( 
            <View style={styles.chatR}>
        <Text key={key} style={styles.chatText}>
          {msg[key].input}
        </Text>
        </View>
      ))}
        </View>
        <View style={{width:'80%', display:'flex', flexDirection:'row', flexBasis:'center'}}>
          <TextInput style={styles.chatInput} onChangeText={(text) => setInputValue(text)}
        value={inputValue} placeholder='Digite sua mensagem...'/>
          <Ionicons onPress={handlePostRequest} style={{position:'absolute', right:10, bottom:15}} name='send' size={15}></Ionicons>
        </View>
      </SafeAreaView>
    )
  }
  const Cadastro = (props)=>{
    return(
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro</Text>
      <TextInput style={styles.input} placeholder='Nome completo'/>
      <TextInput style={styles.input} placeholder='Telefone'/>
      <TextInput style={styles.input} placeholder='Data de nascimento'/>
      <TextInput style={styles.input} placeholder='E-mail'/>
      <TextInput style={styles.input} placeholder='Senha'/>
      <TextInput style={styles.input} placeholder='Confirme sua senha'/>
      <Text style={{textDecorationLine:'underline'}}>Já tenho uma conta</Text>
      <TouchableOpacity style={styles.button}><Text>Cadastrar</Text></TouchableOpacity>
    </View>
    )
  }
  return (
    <View style={{flex:1}}>
      {logado?
    <NavigationContainer>
      <Navigator >
        <Screen  name="Home" options={{ headerShown: false,tabBarShowLabel: false, tabBarActiveTintColor: 'lightblue',tabBarIcon:({focused,color,size})=>{
          let iconName;
          iconName = focused ? 'home' : 'home-outline';
        return <Ionicons name={iconName} size={size} color={color} />;
        }}}>
          {()=><Home />}
          </Screen>
        <Screen  name="Add"  options={{ headerShown: false,tabBarShowLabel: false, tabBarActiveTintColor: 'lightblue',tabBarIcon:({focused,color,size})=>{
          let iconName;
          iconName = focused ? 'ios-add-circle' : 'ios-add-circle-outline';
        return <Ionicons name={iconName} size={size} color={color} />;
        }}}>
          {()=><ModalAdd onSave={inserirRefeicao}/>}
          </Screen>
        <Screen name="Chat" options={{ headerShown: false,tabBarShowLabel: false,tabBarActiveTintColor: 'lightblue', tabBarIcon:({focused,color,size})=>{
          let iconName;
            iconName = focused ? 'chatbox' : 'chatbox-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        } }}>
          {()=><Chat />}
        </Screen>
      </Navigator>
    </NavigationContainer>
    :
    <Login isLogado={setLogado}/>}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap:15
  },
  input:{
    width:'70%',
    backgroundColor: 'lightblue',
    color:'#000',
    padding:10,
    height:50
  },
  title:{
    fontSize: 40,
    marginBottom:20
  },
  button:{
    width:'70%',
    height:50,
    backgroundColor: 'lightblue',
    color:'#000',
    padding:10,
    justifyContent:'center',
    alignItems:'center',
    borderRadius:15
  },
  chatL:{
    backgroundColor:'lightblue',
    borderRadius:10,
    width:'60%',
    padding:10,
    justifyContent:'center',
    alignItems:'center',
    alignSelf:'flex-start',
    marginLeft: 20
  },
  chatR:{
    backgroundColor:'#6abbfc',
    borderRadius:10,
    width:'60%',
    padding:10,
    justifyContent:'center',
    alignItems:'center',
    alignSelf:'flex-end',
    marginRight: 20
  },
  chatText:{
    fontSize:17,
    color:'#000'
  },
  chatInput:{
    backgroundColor:'lightblue',
    borderRadius:10,
    padding:10,
    width:'100%'
  },
  refeicao:{
    backgroundColor: 'lightblue',
    borderRadius:15,
    padding:10,
    width:'70%',
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    alignSelf:'center',
    marginBottom:15
  },
  calendario:{
    borderWidth:1,
    borderColor:'#d9d9d9',
    borderRadius:10,
    padding:5,
    width:'100%',
    justifyContent:'space-around',
    flexDirection:'row',
    alignSelf:'center'
  }

});