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

module.exports={
	cursosAsignados
}