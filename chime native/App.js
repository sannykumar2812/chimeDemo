
import React, { useRef, useState } from 'react';
import axios from 'axios';
import * as Chime from 'amazon-chime-sdk-js';

import {
  StyleSheet,
  Text,
  View,
Button,
PermissionsAndroid
} from 'react-native';

function App() {
  const [meetingResponse, setMeetingResponse] = useState()
  const [attendeeResponse, setAttendeeResponse] = useState()
  const [callCreated, setCallCreated] = useState(false)
  const videoElement = useRef()


  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("You can use the camera");
      } else {
        console.log("Camera permission denied");
      }
    } catch (err) {
      console.warn(err);
    }
  };

  


  const startCall = async () => { 
    const response = await axios.get('http://172.20.10.3:3001/meeting')
    console.log("api reponse from startCall",response.data.meetingResponse)
    console.log("api attende from startCall",response.data.attendee)
    setMeetingResponse(response.data.meetingResponse)
    setAttendeeResponse(response.data.attendee)
    setCallCreated(true)
  }
  const joinVideoCall = async () => { 
    const logger = new Chime.ConsoleLogger('ChimeMeetingLogs', Chime.LogLevel.INFO);
    const deviceController = new Chime.DefaultDeviceController(logger);
    // console.log("api reponse from joinvideoCall",meetingResponse)
    // console.log("api attende from joinvideoCall", attendeeResponse)
    const configuration = new Chime.MeetingSessionConfiguration(meetingResponse, attendeeResponse);
    const meetingSession = new Chime.DefaultMeetingSession(configuration, logger, deviceController);

    const observer = {
      audioVideoDidStart: () => {
        meetingSession.audioVideo.startLocalVideoTile();
      },
      videoTileDidUpdate: tileState => {
        meetingSession.audioVideo.bindVideoElement(tileState.tileId, videoElement.current);
      }
    }

    meetingSession.audioVideo.addObserver(observer);
    const firstVideoDeviceId = (await meetingSession.audioVideo.listVideoInputDevices())[0].deviceId;
    await meetingSession.audioVideo.chooseVideoInputDevice(firstVideoDeviceId);
    meetingSession.audioVideo.start();
  
  }


  return (
    <View className="App" >
      <View >
          <View ref={videoElement}></View>
          <Button 
          style={{color:'red'}} 
          title="join call" 
          disabled={!callCreated}
          onPress={()=> {requestCameraPermission(),joinVideoCall()}} />
        </View>
        <View>
          <Button  title ='start call' onPress={()=> (startCall())} />
        </View>
    
      
    </View>
  );
}


export default App;
