const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
	cursosRegistrados:{
		type:Array,
		require:true
	},
	cursoActual:{
		type:String,
		default:""
	}

})
const usuarios = mongoose.model('usuariosRegistrados', registrarUsuariosSchema);

module.exports = usuarios