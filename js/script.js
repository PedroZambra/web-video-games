import {firebaseConfig} from './firebase.js';

//Initialize Firebase
firebase.initializeApp(firebaseConfig);

firebase.auth().onAuthStateChanged(user => {
    if (user) {
        page.redirect('/user/'+ user.uid);
        document.getElementById('title').innerHTML = `<a href="/user/${user.uid}"> <h1> GAMERS </h1> </a>`;
    } else {
        page.redirect('/');
        document.getElementById('title').innerHTML = `<a href="/"> <h1> GAMERS </h1> </a>`;
    }
});

//ROUTER
page('/', index);
page('/search/:id', games);
page('/register', register);
page('/login', login);
page('/registered', registered);
page('/user/:id', userSession);
page('/user/:id/search/:id', games);
page('/user/:id/favorites', favorites);
page('/user/:id/wanted', wanted);
page('/user/:id/playing', playing);
page('/user/:id/completed', completed);
page();

var info = document.getElementById('info');
var render = document.getElementById('render');
var userPanel = document.getElementById('toUser');

//PANTALLA DE INICIO
function index() {
    userPanel.innerHTML = ` <li> 
                                <a href="/register"> Regístrate </a> 
                            </li>
                            <li> 
                                <a href="/login"> Iniciar sesión </a> 
                            </li>`;                                              

    render.innerHTML = `<div>
                            <h1>¡Bienvenido!</h1> 
                            <p>Busca juegos o registrate si no estas logeado para guardar tus favoritos y más.</p>
                        </div>`;
}


//PANTALLA DE REGISTRO
function register() {
    render.innerHTML = `<div class="panel">
                            <h3>Register</h3>
                            <input type="text" id="email" placeholder="Correo">
                            <input type="password" id="pass" placeholder="Contraseña">
                            <input type="submit" id="register" value="Enviar" data-action="submitRegistrer">
                        </div>`;
}

//PANTALLAD DE INICIO DE SESION
function login() {
    render.innerHTML = `<div class="panel">
                            <h3>Login</h3>
                            <input type="text" id="emailLogin" placeholder="Correo">
                            <input type="password" id="passLogin" placeholder="Contraseña">
                            <input type="submit" id="login" value="Enviar" data-action="submitLogin">
                        </div>`;
}

//PANTALLA REGISTRO ÉXITO
function registered() {
    render.innerText= "Registrado con éxito. Inicia sesión para entrar en tu cuenta.";
}

//PANTALLA DE USUARIO - INICIADA SESION
function userSession(id) {
    userPanel.innerHTML = `<li> <a href="" data-action="logOut"> Salir </a> </li>`;
    info.innerHTML = '';
    render.innerHTML = `<div id="subMenu">
                            <div> <h3> ¡Bienvenido ${firebase.auth().currentUser.email}! </h3> </div>
                            <div class="subMenuButtons"> <a href="/user/${id.params.id}/favorites"> Favoritos </a> </div>
                            <div class="subMenuButtons"> <a href="/user/${id.params.id}/wanted"> Quiero jugarlos </a> </div>
                            <div class="subMenuButtons"> <a href="/user/${id.params.id}/playing"> Jugando </a> </div>
                            <div class="subMenuButtons"> <a href="/user/${id.params.id}/completed"> Completados </a> </div>
                        </div>`;
}

//DESLOGUEAR
userPanel.addEventListener('click', e => {
    const target = e.target.getAttribute("data-action");
    if(target === "logOut") {
        firebase
            .auth()
            .signOut()
            .then(() => {
                info.innerHTML= '';
                render.innerHTML= '';
                //El observador actua y regresa a '/'
            })
            .catch(err => alert("ERROR", err)); 
    }
})

//AUTH
render.addEventListener('click', e => {
    const target = e.target.getAttribute("data-action");
    if(target === "submitRegistrer") {
        let email = document.getElementById('email').value;
        let pass = document.getElementById('pass').value;

        //COMPROBACIONES CORREO Y CONTRASEÑA
        var emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        if (emailRegex.test(email) === false) {
            alert('Introduce un correo válido.');
            return;
        }
        if (pass.length < 8) {
            alert('Introduce una contraseña de mínimo 8 caracteres.');
            return;
        }

        firebase
            .auth()
            .createUserWithEmailAndPassword(email, pass)
            .then(() => {
                page.redirect('/registered');
            })
            .catch(error => alert(error.message));
    }

    if (target === "submitLogin") {
        let email = document.getElementById('emailLogin').value;
        let pass = document.getElementById('passLogin').value;

        firebase
            .auth()
            .signInWithEmailAndPassword(email, pass)
            .then(() => {
                // console.log("Sesión de usuario")
                // Observador actua y redirige a pantalla de usuario
            })
            .catch(error => alert(error.message));
    }
});


//BUSQUEDA DE JUEGOS
document.getElementById('gameSearch').addEventListener('keydown', e => {
    if (e.keyCode === 13) {
        let game = document.getElementById('gameSearch').value;
        if(firebase.auth().currentUser){
            page.redirect('/user/'+firebase.auth().currentUser.uid+'/search/'+game);
        } else {
            page.redirect('/search/'+game);
        }
    }
});

//PANTALLA DE JUEGOS - DIFERENTES RUTAS SESION
function games(game){
    render.innerHTML = '';
    //Búsqueda de videojuegos
    fetch('https://api.rawg.io/api/games?search='+game.params.id)
        .then(res => res.json())
        .then(data => {
            // console.log(data);
            data.results.forEach(game => {
                render.innerHTML += printGame(game);
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
        let genres = '';
        for (let i = 0; i < game.genres.length; i++) {
            genres += `<li>${game.genres[i].name}</li>`;
        }
        return genres;
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

//AGREGAR JUEGOS A LISTAS DE USUARIOS
render.addEventListener('click', e => {
    const target = e.target.getAttribute("data-action");
    const key = e.target.parentElement.getAttribute("data-key");

    if(target === 'favorite' || target === 'wanted' || target === 'playing' || target === 'completed') {
        fetch('https://api.rawg.io/api/games/'+key)
            .then(res => res.json())
            .then(data => {
                addGame(target, data);
            })
    }

    const folder = e.target.getAttribute("data-folder");

    if(target === 'delete'){
        deleteGame(folder, key);
    }
});

//RUTAS JUEGOS DE CADA USUARIO
function favorites() {
    info.innerHTML = `<h2> FAVORITOS </h2>`;
    seeUserGames('favorite');
}

function wanted() {
    info.innerHTML = `<h2> QUIERO JUGAR </h2>`;
    seeUserGames('wanted');
}

function playing() {
    info.innerHTML = `<h2> JUGANDO </h2>`;
    seeUserGames('playing');
}

function completed() {
    info.innerHTML = `<h2> COMPLETADOS </h2>`;
    seeUserGames('completed');
}

//AÑADIR JUEGO
function addGame(target, game) {
    firebase.database().ref(firebase.auth().currentUser.uid).child(target).push({
        id: game.id,
        name: game.name,
        background_image: game.background_image,
        genres: game.genres,
        released: game.released,
        website: game.website
    })

    // console.log(game);
    alert("Añadido a " + target + ".");
}

//BORRAR JUEGO
function deleteGame(folder, key) {
    if(confirm("¿Estás seguro?")){
        firebase.database().ref(firebase.auth().currentUser.uid).child(folder).child(key).remove();
        seeUserGames(folder);
    }
}

//PINTAR JUEGOS GUARDADOS DE USUARIO
function seeUserGames(folder) {
    render.innerHTML = '';
    firebase.database().ref(firebase.auth().currentUser.uid).child(folder).on('value', snapshot => {
        snapshot.forEach((childSnapshot) => {
            let game = childSnapshot.val();
            render.innerHTML += `<div class="games" data-key="${childSnapshot.key}">
                                                                <img src="${game.background_image}">
                                                                <h3>${game.name}</h3>
                                                                <ul class="genres">
                                                                    ${genres(game)}
                                                                </ul>
                                                                <p>Lanzamiento: ${game.released}</p>
                                                                ${(game.website) ? `<p class="web">WEB: <a href="${game.website}" target="_blank"> ${game.website} </a> </p>` : `<p>No hay web disponible</p>`}
                                                                <input type="button" value="Eliminar" class="delete" data-action="delete" data-folder="${snapshot.key}">
                                                            </div>`
        });
    });
}


