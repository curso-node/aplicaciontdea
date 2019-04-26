const usuariosModel = require('../Models/usuarios')
const cursosModel = require('../Models/cursos')

cursosAsignados=(idDocente)=>{
	cursosAs=[]
	usuariosModel.findOne({identidad:idDocente},(err,resp)=>{
		if (err) {
			throw (err)
		}else{
			doc = resp
			cursosId = doc.cursosAsignados
			for (var i = 0; i < cursosId.length; i++) {
				cursosModel.findOne({_id:cursosId[i]},(err,respuesta)=>{
					if (err) {
						throw (err)
					}else{
						cursosAs.push(respuesta)
					}
				})
			}
		}
	})
	// return cursosAsignados
}

// 
// 
// console.log(date)
// console.log(date.getFullYear()+"/"+mes+"/"+date.getDate())
nuevoTrabajo=(datos)=>{

	date = new Date;
	mes = date.getMonth() + 1;
	hora = date.getHours()
	if (hora>12) {
		hora=hora-12
	}
	informacion={
		titulo:datos.titulo,
		explicacion:datos.explicacion,
		archivo:datos.archivo,
		fechaEntrega:{
			fecha:datos.fechaExp,
			hora:datos.horaExp
		},
		fechaPublicacion:{
			fecha:date.getFullYear()+"/"+mes+"/"+date.getDate(),
			hora:hora+":"+date.getMinutes()
		}
	}
	cursosModel.findOne({_id:datos.cursoID},(err,resp)=>{
		if (err) {
			throw err
		}else{
			cursosModel.updateOne({_id:datos.cursoID},{$push:{trabajos:informacion}},(err,resp)=>{})
			console.log('hecho')
		}
	})
}

module.exports={
	cursosAsignados,
	nuevoTrabajo
}