const fs= require('fs');

//Listado para alcenar registros
let listado = [];

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
        console.log('usuario ya existe');
    } else{
        listado.push(datos);
        guardar();
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
        console.log('Datos almacenados correctamente');
    })
}

module.exports = {
    crearRegistro: crearRegistro
}