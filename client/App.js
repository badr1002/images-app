import React from 'react';
import {  View,Button,Image, StyleSheet,FlatList,TouchableOpacity, ImageBackground } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default class App extends React.Component {
  state = {
    images: [],
    isFocus: false,
    imageFocusSource: null,
    imageFocusId:null
  }
  
  componentDidMount = () => {
    try {
      fetch('http://localhost:5000/images',
        { method: 'GET' })
        .then(res => res.json())
        .then(a => {
        this.setState({ images: a.data });          
       })
    } catch (err) {
      console.log('ERROR: ' + err)
    }
  }


  handleChoosePhoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      noData: true,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    
    try {
      fetch('http://localhost:5000/add/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          "src": result.uri
        })
      }).then(() => {
        fetch('http://localhost:5000/images', { method: 'GET' }).then(res => res.json()).then(a => {
          this.setState({ images: a.data })
        });
      })
  
    } catch (err) {
       console.log('ERROR: ' + err)
    }
  }
  
  handleOpenPhoto = async(src,id) => {
    await this.setState({isFocus:true,imageFocusSource: src,imageFocusId:id });
  }

  handleClosePhoto = async() => {
     await this.setState({isFocus:false,imageFocusSource: null,imageFocusId:null });
  }

  handledeletePhoto = async (id) => {
    try {
     await fetch(`http://localhost:5000/delete/image/${id}`, { method: 'DELETE' }).then(() => {
          fetch('http://localhost:5000/images', { method: 'GET' }).then(res => res.json()).then(a => {
            this.setState({ images: a.data });
            this.setState({isFocus:false,imageFocusSource: null,imageFocusId:null });
          });
       })
    } catch (err) {
      console.log('ERROR: ' + err)
    }
  }

 
  renderItem = ({ item }) => (
     <TouchableOpacity onPress={() => this.handleOpenPhoto(item.src, item.id)}>
      <View style={this.style.ImagesView}>
         <Image
          style={this.style.photos}
          source={{ uri: `${item.src}` }}
        />
       </View>
    </TouchableOpacity>
     
  );

  
  render() {
    if (!this.state.isFocus) {
      return (
      <View style={this.style.Container}>
        <Button
        title="Choose Photo"
        onPress={this.handleChoosePhoto}
          />
          <FlatList
          data={this.state.images}
          renderItem={this.renderItem}
          keyExtractor={item=>`${item.id}`}
        />
        </View>
      );
    } else {
      return (
        <View>
          <Button
            title="Delete"
            onPress={()=>this.handledeletePhoto(this.state.imageFocusId)}
          />
          <TouchableOpacity onPress={ this.handleClosePhoto}>           
          <ImageBackground
            style={this.style.ImageFocus}
            source={{uri:(`${this.state.imageFocusSource}`)}}
            />
           </TouchableOpacity>
        </View>
      )
    }
    
  }

   style = StyleSheet.create({
    Container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 5,
   },
    ImagesView: {
      flexDirection: 'row',
      flexWrap: "wrap",
    },
    photos: {
      width: 150,
      height: 150,
      resizeMode: 'stretch',
      margin:'5px'
    },
    ImageFocus: {
      width: '100%',
      height: '100%',
      resizeMode: 'stretch',
      position:'fixed'
    },
 });

 }
