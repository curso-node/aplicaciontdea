const fs= require('fs');
const usuariosModel = require("./Models/usuarios")

//Listado para alcenar registros
let listado = [];
let respuesta;

function crearRegistro (datosEstudiante,foto) {
    let usuarioExiste = false;
    // listar();

    let datos = new usuariosModel({
        identidad : datosEstudiante.dt,
        nombre : datosEstudiante.nombre,
        correo : datosEstudiante.correo,
        contrasena : datosEstudiante.contrasena,
        telefono : datosEstudiante.tel
    })

    let registrar=()=>{ //NOTA: al registrarse no se muestran los mensajes de registro o no registro
        
        if(usuarioExiste){      
          respuesta = {
            estado: 'danger',
            mensaje: 'Ya se encuentra un usuario registrado con  el mismo documento de identidad o correo.'
          }
          return respuesta;
        } else{
            // listado.push(datos);
            // guardar();
            datos.save((err)=>{
                if (err) {
                    console.log(err)
                }  
            })
            respuesta = {
                estado: 'success',
                mensaje: 'Te has registrado satisfactoriamente.'
            }
            return respuesta;    
        }
    }

    usuariosModel.findOne({identidad:datosEstudiante.dt},(err,resp)=>{
        if (err) {
            throw (err)
        }else{
            if (!resp) {
                console.log('resgistrado')
                registrar()
            }else{
                console.log('No registrado')
                usuarioExiste = true;
                registrar()
            }
        }
    })
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