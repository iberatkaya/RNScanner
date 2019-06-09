import React from "react";
import { View, Text, TouchableOpacity, ToastAndroid, Alert, PermissionsAndroid} from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 
//import { AdMobInterstitial } from 'react-native-admob';
import { openDatabase } from 'react-native-sqlite-storage';
const db = openDatabase({name: "Scanned.db", location: 'default'});
import {adunitid} from './appid';

var showad = 0;

export default class HomeScreen extends React.Component { 

  static navigationOptions = ({ navigation }) => ({
    title: 'QR Reader & Generator',
    headerStyle: {backgroundColor: 'skyblue', elevation: 2},
    headerTintColor: '#fff',
    headerLeft: (
      <TouchableOpacity 
        onPress = {()=>{
          navigation.toggleDrawer();
        }}
      >    
      <Icon 
        style = {{paddingLeft: 12}}
        size = {32}
        name = "menu"
      />
      </TouchableOpacity>
    )
  }); 

  componentDidMount() {
    db.transaction(tx => {
        tx.executeSql('CREATE TABLE IF NOT EXISTS QRS (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT, value TEXT);', [], (tx, res) => {}, () => {});    
    });
  /*  AdMobInterstitial.setAdUnitID(adunitid);"ca-app-pub-3940256099942544/1033173712");
    AdMobInterstitial.setTestDeviceID("EMULATOR");
    AdMobInterstitial.addEventListener("interstitialDidClose", () => {
      }
    );*/
}
  /*
  componentWillUnmount() {
    AdMobInterstitial.removeAllListeners();
  }

  async showInterstitial() {
    await AdMobInterstitial.requestAd().then(async () =>  {
      await AdMobInterstitial.showAd();
    });
  }
*/
  render() {
    return (
        <View style={{ flex: 1, alignItems: "stretch"}}>
          <TouchableOpacity
            style = {{flex: 1, backgroundColor: "rgba(255, 140, 140, 0.7)"}} 
            onPress={async () => {
              showad++;  
              if(showad == 2 || showad == 5 || showad == 8){
    //            this.showInterstitial();
              }
              await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA).then((res) => {
                if(res == 'granted')
                  this.props.navigation.navigate("QRScan");
              });
            }}>
            <View style = {{alignItems: 'center', paddingBottom: 20, justifyContent: 'center', flex: 1}}> 
              <Text style = {{color: 'white', fontSize: 50, paddingBottom: 12, fontFamily: 'sans-serif-light'}}>Scan</Text>
              <Icon name = 'qrcode-scan' size = {64} color = "#333333"/>
            </View>
            </TouchableOpacity>
            <TouchableOpacity
              style = {{flex: 1, backgroundColor: "rgba(180, 180, 255, 0.7)"}} 
              onPress={() => {
                showad++;
                if(showad == 2 || showad == 5 || showad == 8){
      //            this.showInterstitial();
                }
                this.props.navigation.navigate("QRGenerator");
              }}>
            <View style = {{alignItems: 'center', paddingBottom: 20, justifyContent: 'center', flex: 1}}> 
              <Text style = {{color: 'white', fontSize: 44, paddingBottom: 10, fontFamily: 'sans-serif-light'}}>Generate</Text>
              <Icon name = 'qrcode' size = {68} color = "#333333"/>
              </View>
            </TouchableOpacity>
          </View>
    );
  }
}
/*
*/


function getPerm() {
  Permissions.request('camera');
}
