const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const cursosRegistradosSchema = new Schema({curso:{type:String}})

const registrarUsuariosSchema = new Schema({
	nombre:{
		type:String
	},
	correo:{
		type:String	
	},
	contrasena:{
		type:String
	},
	identidad:{
		type:Number
	},
	telefono:{
		type:Number
	},
	rol:{
		type:String,
		default:'aspirante'
	},
	cursosRegistrados:[{
			type:Array,
			default:''
		}],
	cursoActual:{
		type:String,
		default:""
	},
	cursosAsignados:{
		type:Array
	}

})
const usuarios = mongoose.model('usuariosRegistrados', registrarUsuariosSchema);

module.exports = usuarios