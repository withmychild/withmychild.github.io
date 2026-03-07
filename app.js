
const firebaseConfig = {
apiKey: "AIzaSyDIWizvGK3AxdRELeCRzk7rJ3ONzjT-0Zk",
authDomain: "mychild-9a4e9.firebaseapp.com",
databaseURL: "https://mychild-9a4e9-default-rtdb.firebaseio.com",
projectId: "mychild-9a4e9",
storageBucket: "mychild-9a4e9.firebasestorage.app",
messagingSenderId: "636633882504",
appId: "1:636633882504:android:eb352e61ce9aa7d32a643d"
};

firebase.initializeApp(firebaseConfig);

firebase.auth().onAuthStateChanged(function(user){
if(!user){
window.location="login.html"
}
});

const logoutBtn=document.getElementById("logout-btn")

if(logoutBtn){
logoutBtn.onclick=function(){
firebase.auth().signOut().then(()=>{
window.location="login.html"
})
}
}
