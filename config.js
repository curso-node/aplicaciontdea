const express = require('express');
const app = express();
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const hbs = require('hbs');
const registrarUsuario = require('./registrarUsuario');
const expressSession = require('express-session');
const MemoryStore = require('memorystore')(expressSession);
const fs= require('fs');
require('./helpers');
const crudsDocente = require('./cruds/docente')
const crudsAspirante = require('./cruds/aspirantes');
const crudCoordinador = require('./cruds/coordinador');

//Models
const cursosModel = require('./Models/cursos')
const usuariosModel=require('./Models/usuarios')

const directorioPublico = path.join(__dirname, '/public');
app.use(express.static(directorioPublico));

const directorioPartials = path.join(__dirname, '/widgets');
hbs.registerPartials(directorioPartials);


//conexion a base de datos con mongoose
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://admintdea:admin@tdea-yhdq8.mongodb.net/tdea?retryWrites=true', {useNewUrlParser: true},(err,resultado)=>{
	if (err) {
		throw (err)
	}else{
		console.log("we're connected")
	}
});
//Permite leer el cuerpo en las respuestas del parametro (req -> peticion)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(expressSession({
	cookie: { maxAge: 86400000 },
    store: new MemoryStore({
      checkPeriod: 900000 // prune expired entries every 15minutes
    }),
 	secret: 'llave', 
 	saveUninitialized: true, 
 	resave: true
 }));

//peticiones servidor
app.use(morgan('dev'));

//Inicializacion HBS
app.set('view engine', 'hbs');

// Rutas de registo y ingreso
app.get('/registrarse', (req, res) =>{
	res.render('registrarse');
});

app.post('/registrarse', (req, res) =>{
	usuariosModel.findOne({identidad: req.body.dt}).exec((err, usuario) => {
		let dato = req.body;
		let notificacion;
		if(err) { console.log(err) }

		if(!usuario){
			let datos = new usuariosModel({
        identidad : dato.dt,
        nombre : dato.nombre,
        correo : dato.correo,
        contrasena : dato.contrasena,
        telefono : dato.tel,
			})	

			datos.save((err)=>{
				if (err) { console.log(err) }	
				console.log("datos guardados");		
			})	

			notificacion = {
				estado: 'success',
				mensaje: 'Te has registrado correctamente'
			}

			res.render("registrarse", {
				notificacion : notificacion
			});

		} else {
			console.log("datos ya están almacenados", usuario);
			notificacion = {
				estado: 'danger',
				mensaje: 'Ya se encuentra un usuario registrado con  el Documento de identidad'
			}
			res.render("registrarse", {
				notificacion : notificacion
			});
		}
	})
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
let baseusuarios =  usuariosModel.find({},(err,resp)=>{
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
			setTimeout(function() {
				res.render('dashboard', {
					success: req.session.succes, 
					'datos': req.session.datosPersona,
					'cursosInscrito' : cursosInscrito
					});
			}, 1000);
		} else if(req.session.succes && req.session.datosPersona.rol === 'coordinador'){
			res.render('dashboard', {
				success: req.session.succes, 
				'datos': req.session.datosPersona,
			});
		} else if (req.session.succes && req.session.datosPersona.rol === 'docente') {

			crudsDocente.cursosAsignados(req.session.datosPersona.identidad)
			setTimeout(function() {
				res.render('dashboardD', {
					success: req.session.succes, 
					'datos': req.session.datosPersona,
					'cursos':cursosAs
				});
			}, 1000);
		}else{
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
				'curso': informacion.Idcurso,
				'profe':profes
			})
		},2000);
	} else{
		res.redirect("../ingresar")
	}
})

app.post('/dashboard/cerrar',(req,res)=>{
	crudCoordinador.cerrar(req.body.ID,req.body.doc)
	console.log("identidad doc:"+req.body.doc)
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
		usuariosModel.find({},(err,respuesta)=>{
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
		usuariosModel.findOne({identidad:req.body.id},(err,resp)=>{
			if (err) {
				throw err
			}else{
				informacion={
					nombre:resp.nombre,
					identidad:resp.identidad,
					correo:resp.correo,
					telefono:resp.telefono,
					rol:resp.rol
				}
				res.render("actualizar",{
					success: req.session.succes, 
					'datos': req.session.datosPersona,
					'informacion':informacion
				})		
			}
		})
	}
	else{
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
app.post('/misEstudiantes',(req,res)=>{
	if (req.session.succes) {
		cursosModel.findOne({_id:req.body.idCurso},(err,resp)=>{
			if (err) {
				throw (err)
			}else{
				cursoInscritos=resp.personasRegistradas
				personas = []
				cursoInscritos.map((value)=>{
					usuariosModel.findOne({identidad:value},(err,resp)=>{
						if (err) {
							throw (err)
						}else{
							console.log("ciclo"+resp)
							personas.push(resp)
						}
					})
				})
				setTimeout(function() {
					console.log("final"+personas)
					res.render("verEstudiantes",{
						success: req.session.succes, 
						'datos': req.session.datosPersona,
						'estudiante':personas
					})
				}, 2000);
			}
		})
	}else{
		res.redirect('../ingresar')
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