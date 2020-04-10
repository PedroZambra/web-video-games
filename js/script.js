//Firebase configuration
var firebaseConfig = {
    apiKey: config.API_KEY_FIREBASE,
    authDomain: "rawg-games.firebaseapp.com",
    databaseURL: "https://rawg-games.firebaseio.com",
    projectId: "rawg-games",
    storageBucket: "rawg-games.appspot.com",
    messagingSenderId: "301530881168",
    appId: "1:301530881168:web:f26534fc9212a3ebd44c15"
};
//Initialize Firebase
var fire = firebase.initializeApp(firebaseConfig);
// console.log(firebase.auth().currentUser.uid);

//ROUTER
var isLogin = false;
page('/', () => {
    if(isLogin) {
        page.redirect('/user');
    } else {
        page.redirect('/login');
    }
});
page('/login', login);
page('/registered', registered);
page('/user/:id', user);
page();

//PANTALLA DE LOGIN & REGISTRO
function login() {
    document.getElementById('toUser').innerHTML = ` <input type="button" value="Regístrate" data-action="register">
                                                    <input type="button" value="Inicia sesion" data-action= "login">`;

    document.getElementById('info').innerHTML=` <h1>¡Bienvenido!</h1> 
                                                <p>Busca juegos o registrate si no estas logeado para guardar tus favoritos y más.</p>`;
}

document.getElementById('toUser').addEventListener('click', e => {
    const target = event.target.getAttribute("data-action");
    if(target === 'register'){
        document.getElementById("info").innerHTML= `<div class="panel">
                                                        <h3>Register</h3>
                                                        <input type="text" id="user" placeholder="Usuario">
                                                        <input type="password" id="pass" placeholder="Contraseña">
                                                        <input type="submit" id="register" value="Enviar" data-action="submitRegistrer">
                                                    </div>`;
    } 

    if(target === 'login') {
        document.getElementById("info").innerHTML= `<div class="panel">
                                                        <h3>Login</h3>
                                                        <input type="text" id="userLogin" placeholder="Usuario">
                                                        <input type="password" id="passLogin" placeholder="Contraseña">
                                                        <input type="submit" id="login" value="Enviar" data-action="submitLogin">
                                                    </div>`;
    }

    if(target === "logOut") {
        firebase
            .auth()
            .signOut()
            .then(() => {
                console.log("Deslogueado!");
                page.redirect('/login');
            })
            .catch(err => console.log(err))
    }
})

//PANTALLA DE USUARIO
function user(id) {
    console.log(id);
    document.getElementById('toUser').innerHTML = `<input type="button" value="Salir" data-action="logOut">`;
    document.querySelector('section').innerText= "Esta es la sesión del usuario "+ id.params.id;
}

//PANTALLA REGISTRO ÉXITO
function registered() {
    document.querySelector('section').innerText= "Registrado con éxito. Inicia sesión para entrar en tu cuenta.";
}

//AUTH
document.getElementById('info').addEventListener('click', e => {
    const target = e.target.getAttribute("data-action");
    if(target === "submitRegistrer") {
        let user = document.getElementById('user').value;
        let pass = document.getElementById('pass').value;

        firebase
        .auth()
        .createUserWithEmailAndPassword(user, pass)
        .then(() => {
            console.log("Usuario registrado")
            page.redirect('/registered');
        })
        .catch(error => alert(error.message));
    }

    if (target === "submitLogin") {
        let user = document.getElementById('userLogin').value;
        let pass = document.getElementById('passLogin').value;

        firebase
        .auth()
        .signInWithEmailAndPassword(user, pass)
        .then(() => {
            console.log("Sesión de usuario")
            page.redirect('/user/'+firebase.auth().currentUser.uid);
        })
        .catch(error => alert(error.message));
    }
});


//GAMES
document.getElementById('gameSearch').addEventListener('keypress', e => {
    if (e.key === 'Enter') {
        var game = document.getElementById('gameSearch').value;
        document.getElementById('info').innerHTML = '';

        //Búsqueda de videojuegos
        fetch('https://api.rawg.io/api/games?search='+game)
            .then(res => res.json())
            .then(data => {
                console.log(data);
                data.results.forEach(game => {
                    document.getElementById('info').innerHTML += printGames(game);
                });
                
            })
    }
});

function printGames(game) {
    return  `<div>
                <h3>${game.name}</h3>
            </div>`
}




