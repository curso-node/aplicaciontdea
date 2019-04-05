const listadoDeCursos = require('../dataBase/lista-de-cursos');
const fs= require('fs');
let listado = require('../dataBase/usuariosRegistrados.json');

let respuesta = undefined;

function mostrarCursoInscritos (reqCurso, reqDatos) {
    reqCurso = [];
    let listadoIdCurso = reqDatos;
    listadoIdCurso.map( (value) => {
        listadoDeCursos.find( curso => {
            if(value == curso.id) {
                reqCurso.push(curso);
            }
        })
    });

    return reqCurso;
}

function eliminarCurso (idCurso, IdAspirante) {
    let listaCursos = [];
    listado.find( usuario => {
            if(usuario.identidad === IdAspirante){
                usuario.cursosRegistrados.filter( id => {
                    if(id != idCurso){
                        listaCursos.push(id);
                    }
                })
            }
    }) 
    
    listado.find( (usuario) => {
        if(usuario.identidad === IdAspirante) {
            usuario.cursosRegistrados = listaCursos;
            guardar(); 
        }   
    })
    respuesta = {
        estado: 'success',
        mensaje: 'Has cancelado el registro al curso',
        nombre: 'eliminarCurso',
    } 

    return respuesta;
}

function inscribirseAunCurso (datoCurso, idEstudiante) {
    let cursoExiste = false;
    listado.find( (persona) => {
        if(persona.identidad === idEstudiante){
            persona.cursosRegistrados.find( (value) => {
                if(value === datoCurso){
                    cursoExiste = true;
                    return cursoExiste;
                }                
            }); 
            
        if(cursoExiste){
            respuesta = {
                estado: 'danger',
                mensaje: 'Ya estás registado al curso',
                nombre: 'registroMalo',
              }
        } else {
            persona.cursosRegistrados.push(datoCurso);
            guardar(); 
            respuesta = {
                estado: 'success',
                mensaje: 'Te has registado al curso',
                nombre: 'registroBueno',
              }              
         }
        }
    })

    return respuesta;
}

const guardar = () => {
    let datos = JSON.stringify(listado, null, 2);

    fs.writeFile('./database/usuariosRegistrados.json', datos, (err) =>{
        if(err) throw err;
        console.log('Datos almacenados correctamente');
    })
}

module.exports = {
    mostrarCursoInscritos : mostrarCursoInscritos,
    inscribirseAunCurso : inscribirseAunCurso,
    eliminarCurso: eliminarCurso
}