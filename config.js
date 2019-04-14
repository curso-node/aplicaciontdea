const express = require('express');
const app = express();
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const hbs = require('hbs');
// const registrarUsuario = require('./dataBase/registrarUsuario');
const expressSession = require('express-session');
// const listadoDeCursos = require('./dataBase/lista-de-cursos');
const fs= require('fs');
require('./helpers');
const crudsAspirante = require('./cruds/aspirantes');
const crudCoordinador = require('./cruds/coordinador');
// const listadoDeUsuarios = require('./dataBase/usuariosRegistrados');

//Models
const cursosModel = require('./Models/cursos')
const usuarioModels=require('./Models/usuarios')

const directorioPublico = path.join(__dirname, '/public');
app.use(express.static(directorioPublico));

const directorioPartials = path.join(__dirname, '/widgets');
hbs.registerPartials(directorioPartials);

//conexion a base de datos con mongoose
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/tdea', {useNewUrlParser: true});
//verificar conexion
const connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open', function() {
  console.log("we're connected")
});

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

	res.render("registrarse", {
		notificacion : datoRegistro
	});
});

app.get('/ingresar', (req, res) =>{
	res.render('ingresar',{
		success: req.session.succes, 
		'datos': req.session.datosPersona
	});
});

app.post('/ingresar', (req, res) =>{
	
let ingresar =() =>{ 
	let verificar = require('./validarAccesos');
	let validarUsuario = verificar.existeUsuario(req.body,baseusuarios);
	console.log(validarUsuario.usuarioExiste)
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
}
let baseusuarios =  usuarioModels.find({},(err,resp)=>{
	    if (err) {
	        throw (err)
	    }else{
	        baseusuarios = resp
	        ingresar()
	    }
	})	
});

app.get('/dashboard/todos-los-cursos', (req, res ) => {
	if(req.session.succes && req.session.datosPersona.rol === 'aspirante'){
		cursosModel.find({estado:"disponible"},(err,respuesta)=>{
			if (err) {
				throw (err)
			}else{
				res.render('todos-los-cursos',{
					success: req.session.succes, 
					'datos': req.session.datosPersona,
					'listadoCursos' : respuesta
				})
			}

		})
	} else{
		res.redirect('../ingresar');
	}
})

// Dashboard para todos los roles
app.get('/dashboard', (req,res) => {
	if(req.session.succes){
		if(req.session.succes && req.session.datosPersona.rol === 'aspirante'){
			let cursosInscrito = crudsAspirante.mostrarCursoInscritos(req.session.datosPersona.identidad);
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

app.post('/cancelarCurso', (req,res) => {	
	if(req.session.succes){
		let cancelarCurso;
		let datoRegistro;
    	//Cancelar un curso
		cancelarCurso = crudsAspirante.eliminarCurso(req.body.cancelar_idCurso, req.body.cancelar_identidad);
		datoRegistro = cancelarCurso;

    // //Mostrar cursos inscrito
    let cursosInscrito= crudsAspirante.mostrarCursoInscritos(req.body.cancelar_identidad);

    res.render('dashboard', {
      success: req.session.succes, 
      'datos': req.session.datosPersona,
			'cursosInscrito' : cursosInscrito,
			notificacion: datoRegistro
    });
	} else{
		res.redirect('ingresar');
	}
})
app.post('/registrarseCurso', (req,res) => {	
	if(req.session.succes){
		let datoRegistro;
		let confirmarRegistro;

		//registrase a un curso
		confirmarRegistro = crudsAspirante.inscribirseAunCurso(req.body.idCurso, req.body.identidad);
		datoRegistro = confirmarRegistro;

    //Mostrar cursos inscrito
    let cursosInscrito= crudsAspirante.mostrarCursoInscritos(req.body.identidad);
    
    res.render('dashboard', {
      success: req.session.succes, 
      'datos': req.session.datosPersona,
			'cursosInscrito' : cursosInscrito,
			notificacion: datoRegistro
    });
	} else{
		res.redirect('ingresar');
	}
})
app.get('/dashboard/crear',(req,res)=>{
	if (req.session.succes) {
		res.render('crearCursos', {
			success: req.session.succes, 
			'datos': req.session.datosPersona
		});
	}else{
		res.redirect("../ingresar")
	}
});

app.post('/crearCurso',(req,res)=>{
	if (req.session.succes) {
		crudCoordinador.crearCurso(req.body)
		res.render('crearCursos', {
			success: req.session.succes, 
			'datos': req.session.datosPersona
		});
}else{
	res.redirect("../ingresar")
}
});


app.get('/dashboard/Cursos', (req, res) => {
	if(req.session.succes){
		cursosModel.find({},(err,respuesta)=>{
			if (err) {
				console.log(err)
			}
			else{
				res.render('Cursos',{
				success: req.session.succes, 
				'datos': req.session.datosPersona,
				'listadoCursos': respuesta
			})
				
			}
		})
		
	} else{
		res.redirect("../ingresar");
	}
})

app.post('/dashboard/inscritos',(req,res)=>{
	crudCoordinador.verInscritos(req.body.idCur);
	if(req.session.succes){
		setTimeout(function() {
			res.render('inscritos',{
				success: req.session.succes, 
				'datos': req.session.datosPersona,
				'inscritos': informacion.lista,
				'totalInscritos': informacion.total,
				'curso': informacion.Idcurso
			})
		},500);
	} else{
		res.redirect("../ingresar")
	}
})

app.post('/dashboard/cerrar',(req,res)=>{
	crudCoordinador.cerrar(req.body.ID)
	if (req.session.succes) {
		res.render("realizado",{
			success: req.session.succes, 
			'datos': req.session.datosPersona	
		})
	}else{
		res.redirect("../ingresar")
	}
})
app.post("/dashboard/eliminar",(req,res)=>{
	if(req.session.succes){
		crudCoordinador.eliminar(req.body.idPer,req.body.idCur)
		res.render("realizado",{
			success: req.session.succes, 
			'datos': req.session.datosPersona	
		})
	}else{
		res.redirect('../ingresar')
	}

})
app.get('/dashboard/usuarios',(req,res)=>{
	if (req.session.succes) {
		usuarioModels.find({},(err,respuesta)=>{
			if (err) {
				throw (err)
			}else{
				res.render('verUsuarios',{
					success: req.session.succes, 
					'datos': req.session.datosPersona,
					'lista':respuesta
				})
			}
		})
	}else{
		res.redirect('../ingresar')
	}		

})
app.post("/dashboard/actualizar",(req,res)=>{
	if(req.session.succes){
		crudCoordinador.infoUsu(req.body.id)
	setTimeout(function() {
		res.render("actualizar",{
			success: req.session.succes, 
			'datos': req.session.datosPersona,
			'informacion':informacion
		})
	}, 50);
	}else{
		res.redirect("../ingresar")
	}
})
app.post("/actualizar",(req,res)=>{
	crudCoordinador.actualizar(req.body)
	if (req.session.succes) {
		res.render("realizado",{
			success: req.session.succes, 
			'datos': req.session.datosPersona
		})
	}else{
		res.redirect("../ingresar")
	}
})

app.get('/', (req, res) => {
	cursosModel.find({},(err,respuesta)=>{
		if (err) {
			throw (err)
		}else{
			res.render('index', {
				success: req.session.succes, 
				'datos': req.session.datosPersona,
				'listadoCursos' : respuesta
			});

		}

	
	})
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