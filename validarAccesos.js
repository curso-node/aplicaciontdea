
existeUsuario=(datosUsuario,baseusuarios)=>{
    let datosSesion = {};
    baseusuarios.map( (usuario) => {
        if((datosUsuario.correo == usuario.correo) && (datosUsuario.contrasena == usuario.contrasena)){
            if (usuario.perfil) {
                datosSesion = {
                    datosUsuario: {
                        identidad: usuario.identidad,
                        nombre: usuario.nombre,
                        correo: usuario.correo,
                        rol: usuario.rol,
                        tel: usuario.telefono,
                        cursosRegistrados : usuario.cursosRegistrados,
                        perfil:usuario.perfil.toString('base64'),
                        foto:true
                    },
                    usuarioExiste:true
                    
                };
            }else{
                datosSesion = {
                    datosUsuario: {
                        identidad: usuario.identidad,
                        nombre: usuario.nombre,
                        correo: usuario.correo,
                        rol: usuario.rol,
                        tel: usuario.telefono,
                        cursosRegistrados : usuario.cursosRegistrados,
                        foto:false
                    },
                    usuarioExiste:true
                };
            }   
        }
    })
    return datosSesion;
}

module.exports = {
    existeUsuario : existeUsuario
}