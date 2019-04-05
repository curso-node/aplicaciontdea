const fs= require('fs');

//Listado para alcenar registros
let listado = [];
let respuesta;

function crearRegistro (datosEstudiante) {
    let usuarioExiste = false;
    listar();

    let datos = {
        identidad : datosEstudiante.dt,
        nombre : datosEstudiante.nombre,
        correo : datosEstudiante.correo,
        contrasena : datosEstudiante.contrasena,
        telefono : datosEstudiante.tel,
        rol: 'aspirante',
        cursosRegistrados: []
    }

    listado.forEach( (valor) => {
        if(datos.identidad === valor.identidad){
            usuarioExiste = true;
            return usuarioExiste;
        }
    });

    if(usuarioExiste){      
      respuesta = {
        estado: 'danger',
        mensaje: 'El usuario ya está registrado.'
      }
      return respuesta;

    } else{
        listado.push(datos);
        guardar();
        respuesta = {
          estado: 'success',
          mensaje: 'Te has registrado satisfactoriamente.'
        }
        return respuesta;
    }    
}

const listar = () => {
    try{
        listado = require('./usuariosRegistrados.json');
    } catch (err) {
        let datos = {
            identidad : '123456789',
            nombre : 'Sebastian',
            correo : 'sebastian@gmail.com',
            contrasena : 'sebastian123',
            telefono : '123456',
            rol: 'coordinador',   
        }
        listado.push(datos);
    } 
    
};

const guardar = () => {
    let datos = JSON.stringify(listado, null, 2);

    fs.writeFile('./database/usuariosRegistrados.json', datos, (err) =>{
        if(err) throw err;
       console.log('Se almacenó correctamente')             
    })

}

module.exports = {
    crearRegistro: crearRegistro
}