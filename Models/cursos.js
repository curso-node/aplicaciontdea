const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const personasRegistradasSchema = new Schema({usuario:{type:Number}})
const crearCursoSchema = new Schema({
	nombre:{
		type:String, 
		require:true
	},
	descripcion:{
		type:String, 
		require:true
	},
	estado:{
		type:String,
		default:"disponible"
	},
	costo:{
		type:Number, 
		require:true
	},
	duracion:{
		type:String
	},
	modalidad:{
		type:String
	},
	categoria:{
		type:String
	},
	personasRegistradas:{
		type:Array,
		default:''
	}
});

cursos = mongoose.model('cursos', crearCursoSchema)
// crearCursoSchema.plugin(autoIncrement.plugin, { model: 'crearCurso', field: 'id' });
module.exports=	cursos
