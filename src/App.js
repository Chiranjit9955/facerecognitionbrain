import React, { Component } from 'react';
import Particles from 'react-particles-js';
import './App.css';
import Navigation from './Components/Navigation/Navigation';
import Logo from './Components/Logo/Logo';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm'
import Rank from './Components/Rank/Rank';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition';
import SignIn from './Components/SignIn/SignIn';
import Register from './Components/Register/Register';
//import Clarifai from 'clarifai';

const particlesOptions = {
    particles: {
      number:{
        value: 100,
        density:{
          enable: true,
          value_area: 600
        }
      }
  }
}

/*const app = new Clarifai.App({
  apiKey: '3755aee35d374e69bc4b498aea8030cc'
 });*/

 const initialState = {
  input: '',
  imageUrl: '',
  box:'',
  route:'signin',
  isSignedIn: false,
  user:{
    id:'',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component{
  constructor(){
    super();
    this.state = initialState;
  }

  loadUser = (data) =>{
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  onInputChange = (event) =>{
  this.setState({input:event.target.value});
  }

  calculateFaceDetection = (data) =>{
  const clarifaiFace =  data.outputs[0].data.regions[0].region_info.bounding_box;
  const image = document.getElementById('inputImage');
  const width = Number(image.width);
  const height = Number(image.height);
  //console.log(width,height);
  return {
    leftCol: clarifaiFace.left_col * width,
    topRow: clarifaiFace.top_row * height,
    rightCol: width - (clarifaiFace.right_col * width),
    bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) =>{
   // console.log(box);
    this.setState({box:box});
  }

  onButtonSubmit = () => {
    this.setState({imageUrl:this.state.input});
    console.log('click');
   /* app.models.predict(
        Clarifai.FACE_DETECT_MODEL, 
      this.state.input) */
    fetch('http://localhost:3008/imageurl',{
      method:'post',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        input: this.state.input
      })
    })
    .then(response => response.json())
    .then(response  => {
      if(response){
        console.log('hello');
        fetch('http://localhost:3008/image',{
          method:'put',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({
            id: this.state.user.id
          })
        })
        .then(response => response.json())
        .then(count =>{
          this.setState(Object.assign(this.state.user, {entries:count}))
        })
        .catch(console.log)
      }
      this.displayFaceBox(this.calculateFaceDetection(response))
      //  console.log(response.outputs[0].data.regions[0].region_info.bounding_box)
    })
    
    .catch(err => console.log(err));
  }

  onRouteChange = (route) =>{
    if(route === 'signout'){
      this.setState(initialState)
    }
    else if(route === 'home') {
      this.setState({isSignedIn:true})
    }
    this.setState({route:route});
  }

  render(){
   const {isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
        <Particles className="particles"
              params={particlesOptions}
            />
        
        <Navigation isSignedIn={isSignedIn} onRouteChange = {this.onRouteChange} />
        {route === 'home' 
        ? <div>
            <Logo />
            <Rank name={this.state.user.name} entries={this.state.user.entries}/>
            <ImageLinkForm 
              onInputChange ={this.onInputChange} 
              onButtonSubmit = {this.onButtonSubmit} />
            <FaceRecognition 
              imageUrl ={imageUrl}
              box= {box}/>
          </div>
        : (
            route === 'signin'
            ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
            : <Register onRouteChange ={this.onRouteChange}
                        loadUser= {this.loadUser}/>
          )
         
          }
      </div>
    )
  }
}
export default App;
