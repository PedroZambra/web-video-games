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
        document.getElementById('title').innerHTML = `<a href="/user/${user.uid}">GAMES</a>`;
    } else {
        page.redirect('/');
        document.getElementById('title').innerHTML = `<a href="/">GAMES</a>`;
    }
});

//ROUTER
page('/', index);
page('/search/:id', games);
page('/register', register);
page('/login', login);
page('/registered', registered);
page('/user/:id', user);
page('/user/:id/search/:id', games);
page('/user/:id/my-games', userGames);
page();

//PANTALLA DE INICIO
function index() {
    document.getElementById('toUser').innerHTML = ` <a href="/register"> <input type="button" value="Regístrate" data-action="register"> </a>
                                                    <a href="/login"> <input type="button" value="Inicia sesion" data-action= "login"> </a>`;

    document.getElementById('info').innerHTML = `<div>
                                                    <h1>¡Bienvenido!</h1> 
                                                    <p>Busca juegos o registrate si no estas logeado para guardar tus favoritos y más.</p>
                                                </div>`;
}


//PANTALLA DE REGISTRO
function register() {
    document.getElementById('info').innerHTML = `<div class="panel">
                                                    <h3>Register</h3>
                                                    <input type="text" id="user" placeholder="Usuario">
                                                    <input type="password" id="pass" placeholder="Contraseña">
                                                    <input type="submit" id="register" value="Enviar" data-action="submitRegistrer">
                                                </div>`;
}

//PANTALLAD DE INICIO DE SESION
function login() {
    document.getElementById('info').innerHTML = `<div class="panel">
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

//PANTALLA DE USUARIO - SESION
function user(id) {
    document.getElementById('toUser').innerHTML = `<input type="button" value="Salir" data-action="logOut">`;
    document.querySelector('section').innerHTML = `<div>
                                                        <h3>Esta es la sesión del usuario ${id.params.id}</h3>
                                                        <a href="/user/${id.params.id}/my-games"> <input type="button" value="Mis juegos"> </a>
                                                    </div>`;
}

document.getElementById('toUser').addEventListener('click', e => {
    const target = event.target.getAttribute("data-action");
    if(target === "logOut") {
        firebase
            .auth()
            .signOut()
            .then(() => {
                console.log("Deslogueado!");
                //El observador actua y regresa a '/'
            })
            .catch(err => console.log(err)) 
    }
})

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
        })
        .catch(error => alert(error.message));
    }
});


//GAMES
document.getElementById('gameSearch').addEventListener('keypress', e => {
    if (e.key === 'Enter') {
        var game = document.getElementById('gameSearch').value;
        if(firebase.auth().currentUser){
            page.redirect('/user/'+firebase.auth().currentUser.uid+'/search/'+game);
        } else {
            page.redirect('/search/'+game);
        }
    }
});

//PANTALLA DE JUEGOS SIN SESION
function games(game){
    document.getElementById('info').innerHTML = '';
    //Búsqueda de videojuegos
    fetch('https://api.rawg.io/api/games?search='+game.params.id)
        .then(res => res.json())
        .then(data => {
            console.log(data);
            data.results.forEach(game => {
                document.getElementById('info').innerHTML += printGame(game);
            });
        })
}

const printGame = game => {
    return  `<div class="games">
                <img src="${game.background_image}">
                <h3>${game.name}</h3>
                <ul class="genres">
                    ${genres(game)}
                </ul>
                <p>Lanzamiento: ${game.released}</p>
                ${saveGames(game)}
            </div>`
}


const genres = game => {
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

const saveGames = game => {
    if(firebase.auth().currentUser){
        return `<ul class="options" data-key=${game.id}>
                    <li data-action="favorite">Favoritos</li>
                    <li data-action="wanted">Quiero jugarlo</li>
                    <li data-action="playing">Jugando</li>
                    <li data-action="completed">Completado</li>
                <ul>`;
    } else {
        return '';
    }
}
document.getElementById('info').addEventListener('click', e => {
    const target = e.target.getAttribute("data-action");
    const key = e.target.parentElement.getAttribute("data-key");

    if(target === 'favorite' || target === 'wanted' || target === 'playing' || target === 'completed') {
        fetch('https://api.rawg.io/api/games/'+key)
        .then(res => res.json())
        .then(data => {
            addFavoriteGame(target, data);
        });
    }
});

//PANTALLA DE JUEGOS CON SESION


//JUEGOS DE CADA USUARIO
function userGames() {
    document.querySelector('section').innerHTML = `Estos serian mis juegos guardados`;
}


//ADD GAMES USER
function addFavoriteGame(target, game) {
    firebase.database().ref(firebase.auth().currentUser.uid).child(target).push({
        id: game.id,
        name: game.name,
        background_image: game.background_image,
        genres: game.genres,
        released: game.released,
        website: game.website
    })
    
    console.log(target);
    console.log(game);
    console.log("AÑADIDA");
    //Continuar
}

//DELETE FILM
function deleteFilm(id) {
    firebase.database().ref(firebase.auth().currentUser.uid).child(id).remove();
    sectionFilms.innerText = 'Eliminada!';
}