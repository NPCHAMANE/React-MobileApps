import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { initializeApp } from 'firebase/app';


const firebaseConfig = {
  apiKey: "AIzaSyDHNAG9HnrsTj1IGx_jCLYQCJdqFzI01eA",
  authDomain: "chat-app-7ec20.firebaseapp.com",
  databaseURL: "https://chat-app-7ec20-default-rtdb.firebaseio.com",
  projectId: "chat-app-7ec20",
  storageBucket: "chat-app-7ec20.appspot.com",
  messagingSenderId: "175991429364",
  appId: "1:175991429364:web:09317048a78190bd9526a1",
  measurementId: "G-HC6M9W47FP"
};

if(!firebase.apps.length){
  initializeApp(firebaseConfig);
}


const auth = firebase.auth();
const firestore = firebase.firestore();
const storage = firebase.storage();


export {
   firebase,
   auth,
   firestore,
   storage
};


function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>React & Firebase</h1>
        <SignOut />
      </header>
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign In</button>      
    </>
  )

}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}


function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(30);
  const [messages] = useCollectionData(query, { idField: 'id' });
  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>
      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
      <span ref={dummy}></span>
    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />

      <button type="submit" disabled={!formValue}>Send</button>

    </form>
  </>)
}


function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL} alt=""/>
      <p>{text}</p>
    </div>
  </>)
}


export default App;

