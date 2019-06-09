import React from "react";
import { View, Text, TouchableOpacity, AsyncStorage, Alert, PermissionsAndroid } from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 
import {RNCamera} from 'react-native-camera';
   

export default class QRScanScreen extends React.Component{ 
  constructor(props){
    super(props);
    this.state = {text: "", backgroundColor: 'transparent', showHint: '', displaytext: ''};
  }

  static navigationOptions = ({ navigation })=>{
    const { navigate } = navigation
    return{
      title: 'Scan',
      headerStyle: {backgroundColor: 'skyblue', elevation: 2},
      headerTintColor: '#fff',
      headerRight:(
        <TouchableOpacity
          onPress={async () => {
            //getRollPerm(); implement
            await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE).then((res) => {
              if(res == 'granted')
                navigate("QRScanGallery");
              
            });
          }}
          style = {{paddingRight: 12}}
        >
          <Icon name = "image" size = {32} color = "#ffffff" />
      </TouchableOpacity>
      )
    } 
  }

  _retrieveData = async () => {
    try{
      value = await AsyncStorage.getItem('ShowHint');
      if (value !== null) {
          return value;
      }
      else{
          return "Yes";
      }
    } catch (error) {
        console.log(error);
    }
  };

  
  componentDidMount(){
    this._retrieveData().then((value)=>{
      if(value == "No"){
        this._touch.setNativeProps({opacity: 0});
        this.setState({showHint: "No"});
        }
      //  console.log("mount " + value);
    });
  }

  parseContact = (text) => {
    var newtext = "";
    newtext = text.replace(/\n/g, ",");
    newtext = newtext.replace(/;/g, " ");
    newtext = newtext.replace(/\s+/g, ' ');
    var objstr = "";
    //console.log(newtext);
    var temp = newtext.split(",");
    for(var i in temp){
      temp[i] = temp[i].replace(/:/, '":"');
    }
    var newtext = temp.join("\",\"");
    objstr = ("\"" + newtext + "end").replace(",\"end", "");  
    try{
      var obj = JSON.parse("{" + objstr + "}");
    } catch(e){
      throw "Error in QR Code\n" + text;
    }
    return obj;
  }

  parseSMS = (text) => {
    var i = 0;
    while(text[i] != ':'){
      i++;
    }
    i++;
    var num = "";
    while(text[i] != ':'){
      num += text[i];
      i++;
    }
    i++;
    var mess = "";
    while(i < text.length){
      mess += text[i];
      i++;
    }
    //console.log("Mess: " + mess + "\nNum: " + num);
    var obj = {"Number": num, "Message": mess};
    return obj;
  }

  parseNumber = (text) => {
    var i = 0;
    while(text[i] != ":")
      i++;
    i++;
    var num = "";
    while(i< text.length){
      num += text[i];
      i++;
    }
    return num;
  }

  parseEvent = (text) => {
    var lines = text.split("\n");
    var str = "";
    for(var i in lines){
      if(i != lines.length - 1)
        str += "\"" + lines[i].replace(":", "\":\"") + "\",";
      else
        str += "\"" + lines[i].replace(":", "\":\"") + "\"";
    }
    var obj = JSON.parse("{" + str + "}");
    return obj;
   }

  parseEmail = (text) => {
    var i = 10;
    var mail = "";
    var sub = "";
    var body = "";
    while(text[i] != ";"){
      mail += text[i];
      i++;
    }
    i++;
    //console.log("Mail: " + mail);
    while(text[i] != ":")
      i++;
    i++;
    while(text[i] != ";" && text[i+1] != "B"){
      sub += text[i];
      i++;
    }
    i++;
    //console.log("Sub: " + sub);
    while(text[i] != ":")
      i++;
    i++;
    while(text[i] != ";" && text[i+1] != ";"){
      body += text[i];
      i++;
    }    
    //console.log("Body: " + body);
    var obj = {"Email": mail, "Subject": sub, "Body": body};
    return obj;
  }

  parseWifi = (text) => {
    var passtype = "";
    var ssid = "";
    var pass = "";
    var i = 7;
    while(text[i] != ";"){
      passtype += text[i];
      i++;
    }
    i++;
    while(text[i] != ":")
      i++;
    i++;
    while(text[i] != ";"){
      ssid += text[i];
      i++;
    }
    i++;
    while(text[i] != ":")
      i++;
    i++;
    while(text[i] != ";" && text[i+1] != ";"){
      pass += text[i];
      i++;
    }
    var obj = {"SSID": ssid, "Password": pass, "Encryption": passtype};
    return obj;
  }

  


  render(){
    //getPerm();
      return (
          <RNCamera style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}
            captureAudio = {false}
            onBarCodeRead = {(obj) => {
              //console.log(obj.data);
              var text = obj.data;
              var type = "Text";
              var icon = "format-color-text";
              var sendtext = text;
              var sendobj = {};
              if(text.includes("BEGIN:VCARD") && text.includes("END:VCARD")){
                type = "Contact";
                icon = "account-box-outline";
                try{
                  var cont = this.parseContact(text);
                  sendtext = "";
                  for(var prop in cont){
                    if(prop != "BEGIN" && prop != "END" && prop != "N" && prop != "VERSION" && cont[prop] != ""){
                      if(prop == "FN")
                        sendtext += "Name: " + cont[prop] + "\n";
                      else if(prop == "ORG")
                        sendtext += "Organisation: " + cont[prop] + "\n";
                      else if(prop == "ADR")
                        sendtext += "Address:" + cont[prop] + "\n";
                      else if(prop == "TEL WORK VOICE")
                        sendtext += "Tel (Work): " + cont[prop] + "\n";
                      else if(prop == "TEL HOME VOICE")
                        sendtext += "Tel (Home): " + cont[prop] + "\n";
                      else if(prop == "TEL CELL")
                        sendtext += "Tel (Cell): " + cont[prop] + "\n";
                      else if(prop == "TEL FAX")
                        sendtext += "Tel (Fax): " + cont[prop] + "\n";
                      else if(prop == "EMAIL WORK INTERNET")
                        sendtext += "Email (Work): " + cont[prop] + "\n";
                      else if(prop == "EMAIL HOME INTERNET")
                        sendtext += "Email (Home): " + cont[prop] + "\n";
                      else if(prop == "URL")
                        sendtext += "Website: " + cont[prop] + "\n";
                      else
                        sendtext += prop + ": " + cont[prop] + "\n";
                    }
                  }
                }catch(e){
                  sendtext = e;
                }
              }
              else if(text.includes("BEGIN:VEVENT") && text.includes("END:VEVENT")){
                type = "Event";
                icon = "calendar";
                sendtext = "";
                var obj = this.parseEvent(text);
                for(var prop in obj){
                  if(prop != "BEGIN" && prop != "END"){
                    if(prop == "SUMMARY"){
                      sendtext += "Event: " + obj[prop] + '\n'; 
                    }
                    else if(prop == "DTSTART"){
                      sendtext += "Begin: " + obj[prop][6] + obj[prop][7] + "."  + obj[prop][4] + obj[prop][5] + "."  + obj[prop][0] + obj[prop][1] + obj[prop][2] + obj[prop][3] + '\n'; 
                    }
                    else if(prop == "DTEND"){
                      sendtext += "End: " + obj[prop][6] + obj[prop][7] + "."  + obj[prop][4] + obj[prop][5] + "."  + obj[prop][0] + obj[prop][1] + obj[prop][2] + obj[prop][3] + '\n'; 
                    }
                    else
                      sendtext += prop + ": " + obj[prop] + "\n";
                  }
                }
                sendobj = obj;
              }
              else if(text.includes("MATMSG:")){
                type = "Email";
                icon = "email";
                sendtext = "";
                var obj = this.parseEmail(text);
                for(var prop in obj){
                  if(obj[prop] != "")
                    sendtext += prop + ": " + obj[prop] + '\n';
                }
                sendobj = obj;
              }
              else if(text.includes("WIFI:") && text.includes(";S")){
                type = "Wifi";
                icon = "wifi";
                sendtext = "";
                var obj = this.parseWifi(text);
                for(var prop in obj){
                  if(obj[prop] != "")
                    sendtext += prop + ": " + obj[prop] + '\n';
                }
              }
              else if(text.includes("://") || text.includes("www.")){
                type = "Link";
                icon = "earth";
              }
              else if(text.includes("SMSTO:")){
                type = "SMS";
                icon = "message";
                var obj = this.parseSMS(text);
                sendtext = "";
                for(var prop in obj){
                  if(obj[prop] != "")
                    sendtext += prop + ": " + obj[prop] + '\n';
                }
                sendobj = obj;
              }
              else if(text.includes("tel:")){
                type = "Number";
                icon = "phone";
                sendtext = "Number: " + this.parseNumber(text);
                sendobj = {Number: this.parseNumber(text)};
              }
              this.setState({
                text: text,
                displaytext: sendtext,
                icon: icon,
                backgroundColor: 'rgba(255, 120, 120, 0.5)'
              });
              
              if(this.state.showHint == "No"){
                this.props.navigation.navigate("QRScanResult", {textvalue: sendtext, type: type, icon: icon, obj: sendobj});
              }
            }}
          > 
          <TouchableOpacity
            ref = {comp => this._touch = comp} 
            onPress = {() =>{
              var type = "Text";
              var icon = "format-color-text";
              var sendtext= this.state.text;
              var sendobj = {};
              if(this.state.text.includes("BEGIN:VCARD") && this.state.text.includes("END:VCARD")){
                type = "Contact";
                icon = "account-box-outline";
                try{
                  var cont = this.parseContact(this.state.text);
                  sendtext = "";
                  for(var prop in cont){
                    if(prop != "BEGIN" && prop != "END" && prop != "N" && prop != "VERSION" && cont[prop] != ""){
                      if(prop == "FN")
                        sendtext += "Name: " + cont[prop] + "\n";
                      else if(prop == "ORG")
                        sendtext += "Organisation: " + cont[prop] + "\n";
                      else if(prop == "ADR")
                        sendtext += "Address:" + cont[prop] + "\n";
                      else if(prop == "TEL WORK VOICE")
                        sendtext += "Tel (Work): " + cont[prop] + "\n";
                      else if(prop == "TEL HOME VOICE")
                        sendtext += "Tel (Home): " + cont[prop] + "\n";
                      else if(prop == "TEL CELL")
                        sendtext += "Tel (Cell): " + cont[prop] + "\n";
                      else if(prop == "TEL FAX")
                        sendtext += "Tel (Fax): " + cont[prop] + "\n";
                      else if(prop == "EMAIL WORK INTERNET")
                        sendtext += "Email (Work): " + cont[prop] + "\n";
                      else if(prop == "EMAIL HOME INTERNET")
                        sendtext += "Email (Home): " + cont[prop] + "\n";
                      else if(prop == "URL")
                        sendtext += "Website: " + cont[prop] + "\n";
                      else
                        sendtext += prop + ": " + cont[prop] + "\n";
                    }
                  }
                }catch(e){
                  sendtext = e;
                }
              }
              else if(this.state.text.includes("BEGIN:VEVENT") && this.state.text.includes("END:VEVENT")){
                type = "Event";
                icon = "calendar";
                sendtext = "";
                var obj = this.parseEvent(this.state.text);
                for(var prop in obj){
                  if(prop != "BEGIN" && prop != "END"){
                    if(prop == "SUMMARY"){
                      sendtext += "Event: " + obj[prop] + '\n'; 
                    }
                    else if(prop == "DTSTART"){
                      sendtext += "Begin: " + obj[prop][6] + obj[prop][7] + "."  + obj[prop][4] + obj[prop][5] + "."  + obj[prop][0] + obj[prop][1] + obj[prop][2] + obj[prop][3] + '\n'; 
                    }
                    else if(prop == "DTEND"){
                      sendtext += "End: " + obj[prop][6] + obj[prop][7] + "."  + obj[prop][4] + obj[prop][5] + "."  + obj[prop][0] + obj[prop][1] + obj[prop][2] + obj[prop][3] + '\n'; 
                    }
                    else
                      sendtext += prop + ": " + obj[prop] + "\n";
                  }
                }
                sendobj = obj;
              }
              else if(this.state.text.includes("MATMSG:")){
                type = "Email";
                icon = "email";
                sendtext = "";
                var obj = this.parseEmail(this.state.text);
                for(var prop in obj){
                  for(var prop in obj){
                    if(obj[prop] != "")
                      sendtext += prop + ": " + obj[prop] + '\n';
                  }
                }
                sendobj = obj;
              }
              else if(this.state.text.includes("WIFI:") && this.state.text.includes(";S")){
                type = "Wifi";
                icon = "wifi";
                sendtext = "";
                var obj = this.parseWifi(this.state.text);
                for(var prop in obj){
                  if(obj[prop] != "")
                    sendtext += prop + ": " + obj[prop] + '\n';
                }
              }
              else if(this.state.text.includes("://") || this.state.text.includes("www.")){
                type = "Link";
                icon = "earth";
              }
              else if(this.state.text.includes("SMSTO:")){
                type = "SMS";
                icon = "message";
                var obj = this.parseSMS(this.state.text);
                sendtext = "";
                for(var prop in obj)
                  sendtext += prop + ": " + obj[prop] + '\n'; 
                sendobj = obj;
              }
              else if(this.state.text.includes("tel:")){
                type = "Number";
                icon = "phone";
                sendtext = "Number: " + this.parseNumber(this.state.text);
                sendobj = {Number: this.parseNumber(this.state.text)};
              }
              this.props.navigation.navigate("QRScanResult", {textvalue: sendtext, type: type, icon: icon, obj: sendobj});
            }} >
              <View style = {{backgroundColor: this.state.backgroundColor, marginTop: 100, padding: 12, borderRadius: 16, maxHeight: 250, maxWidth: 220, overflow: 'hidden'}} >
                <Text style = {{fontSize: 18, color: '#000000'}}>{this.state.displaytext}</Text>
              </View>
            </TouchableOpacity>
          </RNCamera>
      );
  };

}