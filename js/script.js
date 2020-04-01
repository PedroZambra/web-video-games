//Router
var isLogin = false;
page('/', () => {
    if(isLogin) {
        page.redirect('/user');
    } else {
        page.redirect('/login');
    }
});
page('/login', login);
page('/user', user);
page('/hola', hola);
page();

function login() {
    document.querySelector('section').innerText = "Login";
}

function user() {
    document.querySelector('section').innerText= "Dentro del usuario";
}

function hola() {
    document.querySelector('section').innerText= "hola";
}


//GAMES
document.getElementById('gameSearch').addEventListener('keypress', e => {
    if (e.key === 'Enter') {
        var game = document.getElementById('gameSearch').value;
        
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

// fetch('https://api.rawg.io/api/platforms')
//     .then(res => res.json())
//     .then(data => {
//         console.log(data);
//     })    



