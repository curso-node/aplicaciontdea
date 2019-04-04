let baseusuarios = require('./dataBase/usuariosRegistrados');

function existeUsuario (datosUsuario) {
    let datosSesion = {};
    baseusuarios.map( (usuario) => {
        if((datosUsuario.correo == usuario.correo) && (datosUsuario.contrasena == usuario.contrasena)){
            datosSesion = {
                datosUsuario: {
                    identidad: usuario.identidad,
                    nombre: usuario.nombre,
                    correo: usuario.correo,
                    rol: usuario.rol,
                    tel: usuario.telefono,
                    cursosRegistrados : usuario.cursosRegistrados
                },
                usuarioExiste: true
            };
        }
    })
    
    return datosSesion;
}

module.exports = {
    existeUsuario : existeUsuario
}
