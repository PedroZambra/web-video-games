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

firebase.auth().onAuthStateChanged(user => {
    if (user) {
        page.redirect('/user/'+ user.uid);
    } else {
        page.redirect('/');
    }
});

//ROUTER
page('/', index);
page('/games/:id', games);
page('/register', register);
page('/login', login);
page('/registered', registered);
page('/user/:id', user);
page();

document.getElementById('title').addEventListener('click', () => {
    page.redirect('/');
})

document.getElementById('toUser').addEventListener('click', e => {
    const target = event.target.getAttribute("data-action");
    if(target === 'register'){
        page.redirect('/register');
    } 

    if(target === 'login') {
        page.redirect('/login');
    }

    if(target === "logOut") {
        firebase
            .auth()
            .signOut()
            .then(() => {
                console.log("Deslogueado!");
                page.redirect('/');
            })
            .catch(err => console.log(err))
        isLogin = false;    
    }
})

//PANTALLA DE INICIO
function index() {
    document.getElementById('toUser').innerHTML = ` <input type="button" value="Regístrate" data-action="register">
                                                <input type="button" value="Inicia sesion" data-action= "login">`;

    document.getElementById('info').innerHTML=` <div>
                                                    <h1>¡Bienvenido!</h1> 
                                                    <p>Busca juegos o registrate si no estas logeado para guardar tus favoritos y más.</p>
                                                </div>`;
}


//PANTALLA DE REGISTRO
function register() {
    document.getElementById("info").innerHTML= `<div class="panel">
                                                    <h3>Register</h3>
                                                    <input type="text" id="user" placeholder="Usuario">
                                                    <input type="password" id="pass" placeholder="Contraseña">
                                                    <input type="submit" id="register" value="Enviar" data-action="submitRegistrer">
                                                </div>`;
}

//PANTALLAD DE INICIO DE SESION
function login() {
    isLogin = true;
    document.getElementById("info").innerHTML= `<div class="panel">
                                                    <h3>Login</h3>
                                                    <input type="text" id="userLogin" placeholder="Usuario">
                                                    <input type="password" id="passLogin" placeholder="Contraseña">
                                                    <input type="submit" id="login" value="Enviar" data-action="submitLogin">
                                                </div>`;
}

//PANTALLA REGISTRO ÉXITO
function registered() {
    document.querySelector('section').innerText= "Registrado con éxito. Inicia sesión para entrar en tu cuenta.";
}

//PANTALLA DE USUARIO
function user(id) {
    document.getElementById('toUser').innerHTML = `<input type="button" value="Salir" data-action="logOut">`;
    document.querySelector('section').innerText= "Esta es la sesión del usuario "+ id.params.id;
}

//PANTALLA DE JUEGOS
function games(game){
    document.getElementById('info').innerHTML = '';

    //Búsqueda de videojuegos
    fetch('https://api.rawg.io/api/games?search='+game.params.id)
        .then(res => res.json())
        .then(data => {
            console.log(data);
            data.results.forEach(game => {
                document.getElementById('info').innerHTML += printGames(game);
            });
            
        })
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
            // page.redirect('/user/'+firebase.auth().currentUser.uid);
        })
        .catch(error => alert(error.message));
    }
});


//GAMES
document.getElementById('gameSearch').addEventListener('keypress', e => {
    if (e.key === 'Enter') {
        var game = document.getElementById('gameSearch').value;
        page.redirect('/games/'+game);
    }
});

function printGames(game) {
    return  `<div class="games">
                <img src="${game.background_image}">
                <h3>${game.name}</h3>
                <ul>
                    ${genres(game)}
                </ul>
                <p>Lanzamiento: ${game.released}</p>
            </div>`
}

function genres(game) {
    if(game.genres.length > 0) {
        let ganres = '';
        for (let i = 0; i < game.genres.length; i++) {
            ganres += `<li>${game.genres[i].name}</li>`;
        }
        return ganres;
    } else {
        return `<li>Sin categoría</li>`;
    }
}





