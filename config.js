const express = require('express');
const app = express();
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const hbs = require('hbs');
const registrarUsuario = require('./dataBase/registrarUsuario');
const expressSession = require('express-session');
const listadoDeCursos = require('./dataBase/lista-de-cursos');
const fs= require('fs');
require('./helpers');
const crudsAspirante = require('./cruds/aspirantes');
const crudCoordinador = require('./cruds/coordinador')

const directorioPublico = path.join(__dirname, '/public');
app.use(express.static(directorioPublico));

const directorioPartials = path.join(__dirname, '/widgets');
hbs.registerPartials(directorioPartials);

//Permite leer el cuerpo en las respuestas del parametro (req -> peticion)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(expressSession({ secret: 'llave', saveUninitialized: false, resave: false}));

//peticiones servidor
app.use(morgan('dev'));

//Inicializacion HBS
app.set('view engine', 'hbs');

// Rutas de registo y ingreso
app.get('/registrarse', (req, res) =>{
	res.render('registrarse');
});

app.post('/registrarse', (req, res) =>{
	let datoRegistro = registrarUsuario.crearRegistro(req.body);	
	console.log(datoRegistro);

	res.render("registrarse", {
		notificacion : datoRegistro
	});
});

app.get('/ingresar', (req, res) =>{
	res.render('ingresar',{
		success: req.session.succes, 
		'datos': req.session.datosPersona,
	});
});

app.post('/ingresar', (req, res) =>{		
	let verificar = require('./validarAccesos');
	let validarUsuario = verificar.existeUsuario(req.body);

		if(validarUsuario.usuarioExiste){
			req.session.datosPersona = validarUsuario.datosUsuario;
			req.session.succes = true;
			res.redirect('dashboard');
		} else {
			let datoRegistro =  {
				estado: 'danger',
				mensaje: 'El usuario o contraseña es incorrecto.'
			}
			req.session.succes = false;
			res.render('ingresar', {
				notificacion : datoRegistro
			});
		}

});

app.get('/dashboard/todos-los-cursos', (req, res ) => {
	if(req.session.succes && req.session.datosPersona.rol === 'aspirante'){
		res.render('todos-los-cursos',{
			success: req.session.succes, 
			'datos': req.session.datosPersona,
			'listadoCursos' : listadoDeCursos
			})
	} else{
		res.redirect('../ingresar');
	}
})

// Dashboard para todos los roles
app.get('/dashboard', (req,res) => {
	if(req.session.succes){
		if(req.session.succes && req.session.datosPersona.rol === 'aspirante'){
			let cursosInscrito= crudsAspirante.mostrarCursoInscritos(req.session.cursosInscrito, req.session.datosPersona.cursosRegistrados);
			res.render('dashboard', {
				success: req.session.succes, 
				'datos': req.session.datosPersona,
				'cursosInscrito' : cursosInscrito
				});
		} else if(req.session.succes && req.session.datosPersona.rol === 'coordinador'){
			res.render('dashboard', {
				success: req.session.succes, 
				'datos': req.session.datosPersona,
			});
		} else {
			res.redirect('ingresar');
		}
	}	
})

app.post('/dashboard', (req,res) => {	
	if(req.session.succes){
    crudsAspirante.inscribirseAunCurso(req.body.idCurso, req.body.identidad);
    
    //Traer los ultimos cambios en la base de datos de los usuarios
    let baseUsuarios = require('./dataBase/usuariosRegistrados');
    let traerDatosUsuario = baseUsuarios.find( datos => {
      return (datos.identidad == req.session.datosPersona.identidad);
    })
    
    //Cancelar un curso
    crudsAspirante.eliminarCurso(req.body.cancelar_idCurso, req.body.cancelar_identidad);

    //Mostrar cursos inscrito
    req.session.datosPersona = traerDatosUsuario;
    let cursosInscrito= crudsAspirante.mostrarCursoInscritos(req.session.cursosInscrito, req.session.datosPersona.cursosRegistrados);

    res.render('dashboard', {
      success: req.session.succes, 
      'datos': req.session.datosPersona,
      'cursosInscrito' : cursosInscrito
    });
	} else{
		res.redirect('ingresar');
	}
})
app.get('/dashboard/crear',(req,res)=>{
	res.render('crearCursos', {
		success: req.session.succes, 
		'datos': req.session.datosPersona
	});
});
app.post('/crearCurso',(req,res)=>{
	crudCoordinador.crearCurso(req.body)
	res.render('crearCursos', {
		success: req.session.succes, 
		'datos': req.session.datosPersona
	});

});
app.get('/dashboard/Cursos', (req, res ) => {
	let listadoDeCursos = require('./dataBase/lista-de-cursos.json');
	res.render('Cursos',{
		success: req.session.succes, 
		'datos': req.session.datosPersona,
		'listadoCursos': listadoDeCursos
	})
})
app.post('/dashboard/inscritos',(req,res)=>{
	crudCoordinador.verInscritos(req.body.idCur);
	res.render('inscritos',{
		success: req.session.succes, 
		'datos': req.session.datosPersona,
		'lista': infoPersonasRegistradas
	})
})


app.get('/', (req, res) => {
	res.render('index', {
		success: req.session.succes, 
		'datos': req.session.datosPersona,
		'listadoCursos' : listadoDeCursos
		});
});

// Ruta para cerrar la sesion
app.get('/salir', ( req, res ) => {
	req.session.datosPersona = undefined;
	req.session.succes = false;
	res.redirect('/ingresar');
})

app.get('*', (req, res) => {
	res.send('Página no existe');
});


const PORT = 3000;
app.listen(PORT, function () {
	console.log(`Servidor iniciado en el puerto ${PORT}`);
});