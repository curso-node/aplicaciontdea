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
const listadoDeUsuarios = require('./dataBase/usuariosRegistrados')

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
		let confirmarRegistro;
		let cancelarCurso;
		let datoRegistro;
		confirmarRegistro = crudsAspirante.inscribirseAunCurso(req.body.idCurso, req.body.identidad);
    
    //Traer los ultimos cambios en la base de datos de los usuarios
    let baseUsuarios = require('./dataBase/usuariosRegistrados');
    let traerDatosUsuario = baseUsuarios.find( datos => {
      return (datos.identidad == req.session.datosPersona.identidad);
		})
    
    //Cancelar un curso
		cancelarCurso = crudsAspirante.eliminarCurso(req.body.cancelar_idCurso, req.body.cancelar_identidad);
		
		if(confirmarRegistro){
			datoRegistro = confirmarRegistro;
		} else {
			datoRegistro = cancelarCurso;
		}

    //Mostrar cursos inscrito
    req.session.datosPersona = traerDatosUsuario;
    let cursosInscrito= crudsAspirante.mostrarCursoInscritos(req.session.cursosInscrito, req.session.datosPersona.cursosRegistrados);

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
	res.render('crearCursos', {
		success: req.session.succes, 
		'datos': req.session.datosPersona
	});
});
app.post('/crearCurso',(req,res)=>{
	let datoRegistros = crudCoordinador.crearCurso(req.body);
	console.log(datoRegistros);
	res.render('crearCursos', {
		success: req.session.succes, 
		'datos': req.session.datosPersona
	});

});


app.get('/dashboard/Cursos', (req, res ) => {
	if(req.session.succes){
		res.render('Cursos',{
			success: req.session.succes, 
			'datos': req.session.datosPersona,
			'listadoCursos': listadoDeCursos
		})
	} else{
		res.redirect("../ingresar");
	}
})

app.post('/dashboard/inscritos',(req,res)=>{
crudCoordinador.verInscritos(req.body.idCur);
if(req.session.succes){
	res.render('inscritos',{
		success: req.session.succes, 
		'datos': req.session.datosPersona,
		'inscritos': informacion.lista,
		'totalInscritos': informacion.total,
		'curso': informacion.Idcurso
	})
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
		res.render('verUsuarios',{
			success: req.session.succes, 
			'datos': req.session.datosPersona,
			'lista':listadoDeUsuarios
		})
	}else{
		res.redirect('../ingresar')
	}		

})
app.post("/dashboard/actualizar",(req,res)=>{
	if(req.session.succes){
		crudCoordinador.infoUsu(req.body.id)
		res.render("actualizar",{
			success: req.session.succes, 
			'datos': req.session.datosPersona,
			'informacion':informacion
		})
	}else{
		res.redirect("../ingresar")
	}
})
app.post("/actualizar",(req,res)=>{
	crudCoordinador.actualizar(req.body)
	if (req.session.succes) {
		res.redirect("/dashboard");
		res.render("realizado",{
			success: req.session.succes, 
			'datos': req.session.datosPersona
		})
	}else{
		res.redirect("../ingresar")
	}
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


//const PORT = 3000;
const process.env.PORT = process.env.PORT || 3000;
app.listen(process.env.PORT, function () {
	console.log(`Servidor iniciado en el puerto ${process.env.PORT}`);
});
