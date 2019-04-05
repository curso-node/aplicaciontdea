const fs = require('fs');
cursos = require('../dataBase/lista-de-cursos');
listaUsu = require('../dataBase/usuariosRegistrados')


const crearCurso=(data)=>{
	const dataC ={
		id:(cursos.length)+1,
		nombre:data.nombre,
		duracion: data.duracion,
		costo:data.costo,
		estado:"disponible",
		modalidad:data.modalidad,
		descripcion:data.descripcion,
		categoria:data.categoria,
		personasRegistradas:[]
	};	
	let Ident = cursos.find(xxx => xxx.id == dataC.id);

	if (!Ident) {
		let nm = cursos.find(varC => varC.nombre == dataC.nombre);
		if (!nm) {

			cursos.push(dataC);
			guardar()

		}else{
			console.log("ya existe un curso con ese nombre");
		}
		
	}else{
		console.log("ya exite un curso con ese ID");
	}
}

const guardar =()=>{
	let texto = JSON.stringify(cursos, null,2)
	fs.writeFile("./dataBase/lista-de-cursos.json",texto,(err)=> {
		if(err){throw(err)}	else{console.log('Realizado con exito')}});
}	
const verInscritos=(curso)=>{
	let IDpersonasRegistradas = cursos.find(cur => cur.id == curso).personasRegistradas
	infoPersonasRegistradas =[]
	for (var i = 0; i < IDpersonasRegistradas.length; i++) {
		infoPersonasRegistradas.push(listaUsu.find(xx=>xx.identidad == IDpersonasRegistradas[i]))
	}
	informacion={
		lista: infoPersonasRegistradas,
		total:IDpersonasRegistradas.length,
		Idcurso:curso
	}
}
const cerrar=(lcurso)=>{
		let ab = cursos.find(ab => ab.id==lcurso)
		if (!ab) {
			console.log('Ese curso no existe')
		}else{
			ab['estado']="cerrado"
			guardar()
		}
}
const actualizar=(datos)=>{
	
	let usua = listaUsu.find(wh => wh.identidad == datos.id)
	if (!usua) {
		console.log("El usuario no existe")
	}else{
		usua['nombre'] = datos.nombre
		usua['identidad'] = datos.identidad
		usua['correo'] = datos.correo
		usua['telefono'] = datos.telefono
		usua['rol'] = datos.rol
		guardarUsu()

	}
}
const guardarUsu=()=>{
	let txt = JSON.stringify(listaUsu)
	fs.writeFile("./dataBase/usuariosRegistrados.json",txt,(err)=> {
		if(err){throw(err)}	else{console.log('Realizado con exito')}})
}
const eliminar=(usu,cur)=>{
	
	
	regg()
	let dataUs = listaUsu.find(xf => xf.identidad == usu )
	let dataCur = cursos.find(xfc => xfc.id == cur)
	if (!dataUs || !dataCur) {
		console.log("Uno de los datos es invalido. ¡verifique!")
	}else{
		let nEliminar = usuReg.filter(xx=> xx.curso.id != cur ||  xx.usuarios.id != usu) //no sé por qué funciona con || y no con && pero así funciona
		console.log(nEliminar)
		usuReg = nEliminar
		guardarReg()
	}
}
const infoUsu=(ID,cur)=>{
	
	console.log(ID)
	let infoUsuario = listaUsu.find(iu => iu.identidad == ID)
	informacion={
		nombre:infoUsuario.nombre,
		identidad:infoUsuario.identidad,
		correo:infoUsuario.correo,
		telefono:infoUsuario.telefono,
		rol:infoUsuario.rol,
		curso:cur
	}
}
module.exports={
	crearCurso,
	actualizar,
	eliminar,
	infoUsu,
	verInscritos,
	cerrar

}