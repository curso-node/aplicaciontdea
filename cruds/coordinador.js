//Models
const cursosModel = require('../Models/cursos')
const usuariosModel = require('../Models/usuarios')
usuariosModel.find({},(err,respuesta)=>{
	if (err) {
		console.log(err)
	}
	else{
		usuarios = respuesta
	}	
})


const crearCurso=(data)=>{	
	let crear = new cursosModel({
		nombre:data.nombre,
		duracion:data.duracion,
		costo:data.costo,
		modalidad:data.modalidad,
		descripcion:data.descripcion,
		categoria:data.categoria,
		personasRegistradas:[ ]
	});

	crear.save((err)=>{
		if (err) {
			console.log(err)
		}else{
			console.log("creado con exito")
			
		}
	})
}
const verInscritos=(curso)=>{
	IDpersonasRegistradas = []
	infoPersonasRegistradas = []

	let mostrar=()=>{
		informacion={
			lista: infoPersonasRegistradas,
			total: IDpersonasRegistradas.length,
			Idcurso:curso
		}
	}

	cursosModel.findOne({_id:curso},(err,respuesta)=>
	{
		if (err) 
		{
			return console.log(err)
		}
		cursoSelected = respuesta
		IDpersonasRegistradas = cursoSelected.personasRegistradas
			IDpersonasRegistradas.map((value,index)=>{
				info = usuarios.find(vv =>vv.identidad == IDpersonasRegistradas[index])
				info.cursoActual = curso
				infoPersonasRegistradas.push(info)
			})
			setTimeout(function() {
				mostrar()
			}, 125);
	})
	usuariosModel.find({rol:'docente'},(err,resp)=>{
		if (err) {
			throw (err)
		}else{
			profes = resp
			console.log(profes)
		}
	})
}
const cerrar=(lcurso,idDocente)=>{
	usuariosModel.findOne({_id:idDocente},(err,resp)=>{
		if (err) {
			throw (err)
		}else{
			usuariosModel.updateOne({_id:idDocente},{$push:{cursosAsignados:lcurso}},(err,resp)=>{
				if (err) {
					throw err
				}else{
					cursosModel.updateOne({_id:lcurso},{$set:{estado:'cerrado'}},(err,resp)=>{})
				}
			})
		}
	})
		
}
const actualizar=(datos,foto)=>{
	usuariosModel.updateOne({identidad:datos.id},{$set:{nombre:datos.nombre}},(err,resp)=>{})
	usuariosModel.updateOne({identidad:datos.id},{$set:{correo:datos.correo}},(err,resp)=>{})
	usuariosModel.updateOne({identidad:datos.id},{$set:{telefono:datos.telefono}},(err,resp)=>{})
	usuariosModel.findOne({identidad:datos.id},(err,resp)=>{
		if (err) {
			throw (err)
		}else{
			if (resp.rol != datos.rol) {
				usuariosModel.updateOne({identidad:datos.id},{$set:{rol:datos.rol}},(err,resp)=>{
					if (err) {
						throw (err)
					}else{
						if (datos.rol == "docente") {
							console.log(datos.rol)
							
							usuariosModel.updateOne({identidad:datos.id},{$set:{cursosRegistrados:[]}},(err,resp)=>{
								if (err) {
									throw(err)
								}else{
									console.log(resp)
									usuariosModel.updateOne({identidad:datos.id},{$rename:{'cursosRegistrados':"cursosAsignados"}},(err,resp)=>{
										if (err) {
											throw (err)
										}else{
											console.log(resp)
										}
									})
								}
							})
						}
					}
				})
			}
		}
	})
	if (foto) {
        console.log(foto)
        usuariosModel.updateOne({identidad:datos.id},{$set:{perfil:foto}},(err,resp)=>{})
    }
}
const eliminar=(usu,cur)=>{
	usuariosModel.findOne({identidad:usu},(err,resp)=>{
		if (err) {
			throw (err)
		}else{
			dataUs = resp.cursosRegistrados
			cursosModel.findOne({_id:cur},(err,resp)=>{
				if (err) {
					throw (err)
				}else{
					dataCur = resp.personasRegistradas
				}

				if (!dataUs ) {
					console.log("Uno de los datos es invalido. ¡verifique!")
				}else{
					let personasNoEliminadas= []
					for (var i = 0; i < dataCur.length; i++) {
						if(dataCur[i]!=usu){
							personasNoEliminadas.push(dataCur[i])	
						}
					}
					cursosModel.updateOne({_id:cur},{$set:{personasRegistradas:personasNoEliminadas}},(err,respuesta)=>{})	
						
					cursosNoEliminados = []
					for (var i = 0; i < dataUs.length; i++) {
						if(dataUs[i]!=cur){
							cursosNoEliminados.push(dataUs[i])		
						}
					}
					usuariosModel.updateOne({identidad:usu},{$set:{cursosRegistrados:cursosNoEliminados}},(err,respuesta)=>{})
				}
			})
			
		}
	})
	respuesta = {
        estado: 'success',
        mensaje: 'Has cancelado el registro al curso',
        nombre: 'eliminarCurso',
    } 

    return respuesta;
}

module.exports={
	crearCurso,
	actualizar,
	eliminar,
	verInscritos,
	cerrar

}