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
	infoPersonasRegistradas=[]
	for (var i = 0; i < IDpersonasRegistradas.length; i++) {
		info = listaUsu.find(xx=>xx.identidad == IDpersonasRegistradas[i])
		info.cursoActual = curso
		infoPersonasRegistradas.push(info)
	}
	informacion={
		lista: infoPersonasRegistradas,
		total: IDpersonasRegistradas.length
	}
	console.log(informacion.lista)
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
	console.log(datos.id)
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
	let txt = JSON.stringify(listaUsu,null,2)
	fs.writeFile("./dataBase/usuariosRegistrados.json",txt,(err)=> {
		if(err){throw(err)}	else{console.log('Realizado con exito')}})
}

const eliminar=(usu,cur)=>{
	let dataUs = listaUsu.find(xf => xf.identidad == usu ).cursosRegistrados
	let dataCur = cursos.find(xfc => xfc.id == cur).personasRegistradas
	if (!dataUs ) {
		console.log("Uno de los datos es invalido. ¡verifique!")
	}else{
		console.log("personas:"+dataCur)
		console.log("cursos:"+dataUs)
		let personasNoEliminadas= []
		for (var i = 0; i < dataCur.length; i++) {
			if(dataCur[i]!=usu){
				personasNoEliminadas.push(dataCur[i])
				
			}
		}
		cursos.find(c => c.id == cur).personasRegistradas = personasNoEliminadas
		guardar()
		cursosNoEliminados = []
		for (var i = 0; i < dataUs.length; i++) {
			if(dataUs[i]!=cur){
				cursosNoEliminados.push(dataUs[i])
			}
		}
		listaUsu.find(u => u.identidad == usu).cursosRegistrados = cursosNoEliminados
		guardarUsu()
	}
}
const infoUsu=(ID)=>{
	let infoUsuario = listaUsu.find(iu => iu.identidad == ID)
	informacion={
		nombre:infoUsuario.nombre,
		identidad:infoUsuario.identidad,
		correo:infoUsuario.correo,
		telefono:infoUsuario.telefono,
		rol:infoUsuario.rol
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